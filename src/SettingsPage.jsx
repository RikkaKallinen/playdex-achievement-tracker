import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { platformNames, accentColors } from "./data";
import { cropImage } from "./resizeImage";
import AvatarCropper from "./AvatarCropper";
import { downloadBackup, readBackupFile } from "./backup";
import { formatDate } from "./formatDate";

function SettingsPage({ account, onSignOut, games, hiddenPlatforms, onTogglePlatform, accentColor, onChangeAccent, profile, onUpdateProfile, onSyncSteam, isSyncing, syncStatus, onBuildBackup, onRestoreBackup }) {
    const [draft, setDraft] = useState(profile);
    // Steam sends people back to /settings?signin=ok (or =failed)
    const [searchParams] = useSearchParams();
    const signInResult = searchParams.get("signin");
    const [restoreStatus, setRestoreStatus] = useState("");
    const restoreInputRef = useRef(null);
    const [cropSource, setCropSource] = useState(null);

    const hasChanges = JSON.stringify(draft) !== JSON.stringify(profile);
    // Your own picture if you've set one, otherwise your Steam picture, otherwise your initial
    const steamAvatarUrl = account && account.avatarUrl;
    const shownAvatarUrl = draft.avatarUrl || steamAvatarUrl;

    function updateDraft(changes) {
        setDraft((current) => ({ ...current, ...changes }));
    }

    async function handleRestoreFile(event) {
        const file = event.target.files[0];
        // Clearing it lets the same file be picked again later
        event.target.value = "";
        if (!file) {
            return;
        }

        try {
            const backup = await readBackupFile(file);
            const savedOn = backup.savedAt ? formatDate(backup.savedAt) : "an unknown date";
            const contents = backup.games.length + " games, " + backup.goals.length + " goals, "
                + backup.sessions.length + " sessions, " + backup.journalEntries.length + " journal entries";

            if (!confirm("Replace everything in Playdex with the backup from " + savedOn + " (" + contents + ")? What's here now will be lost.")) {
                return;
            }

            onRestoreBackup(backup);
            // The profile form keeps its own copy, so it needs the restored profile too
            if (backup.profile) {
                setDraft(backup.profile);
            }
            setRestoreStatus("Restored the backup from " + savedOn + ".");
        } catch (error) {
            setRestoreStatus(error.message);
        }
    }

    function addGamertag() {
        updateDraft({
            gamertags: [
                ...draft.gamertags,
                { id: crypto.randomUUID(), platform: "steam", otherPlatform: "", tag: "", shown: true }
            ]
        });
    }

    function updateGamertag(gamertagId, changes) {
        updateDraft({
            gamertags: draft.gamertags.map((gamertag) => {
                if (gamertag.id !== gamertagId) {
                    return gamertag;
                }

                return { ...gamertag, ...changes };
            })
        });
    }

    function removeGamertag(gamertagId) {
        updateDraft({
            gamertags: draft.gamertags.filter((gamertag) => gamertag.id !== gamertagId)
        });
    }

    function handleAvatarFile(event) {
        const file = event.target.files[0];
        event.target.value = "";
        if (!file) {
            return;
        }

        setCropSource(URL.createObjectURL(file));
    }

    async function handleCropDone(area) {
        const avatarUrl = await cropImage(cropSource, area, 128);
        URL.revokeObjectURL(cropSource);
        setCropSource(null);
        updateDraft({ avatarUrl: avatarUrl });
    }

    function handleCropCancel() {
        URL.revokeObjectURL(cropSource);
        setCropSource(null);
    }

    return (
        <section>
            <h2>Settings</h2>
            <h3>Profile</h3>
            <div className="profile-editor">
                <span className="avatar avatar-large" aria-hidden="true">
                    {shownAvatarUrl
                        ? <img src={shownAvatarUrl} alt="" />
                        : (draft.name || "Player").charAt(0).toUpperCase()}
                </span>
                <div className="settings-fields">
                    <label htmlFor="profile-name">Display name</label>
                    <input
                        type="text"
                        id="profile-name"
                        maxLength="30"
                        placeholder="Player"
                        value={draft.name}
                        onChange={(event) => updateDraft({ name: event.target.value })}
                    />
                    <label htmlFor="profile-avatar-file">Avatar image (optional)</label>
                    {!draft.avatarUrl && steamAvatarUrl && (
                        <p className="field-hint">Using your Steam picture. Choose an image to use your own instead.</p>
                    )}
                    <input
                        type="file"
                        id="profile-avatar-file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                    />
                    <label htmlFor="profile-avatar">Or paste an image link</label>
                    <input
                        type="url"
                        id="profile-avatar"
                        placeholder="https://..."
                        value={draft.avatarUrl.startsWith("data:") ? "" : draft.avatarUrl}
                        onChange={(event) => updateDraft({ avatarUrl: event.target.value })}
                    />
                    {draft.avatarUrl && (
                        <button
                            type="button"
                            className="button-quiet"
                            onClick={() => updateDraft({ avatarUrl: "" })}
                        >
                            {steamAvatarUrl ? "Use my Steam picture" : "Remove avatar"}
                        </button>
                    )}
                </div>
            </div>

            {cropSource && (
                <AvatarCropper
                    imageSrc={cropSource}
                    onCancel={handleCropCancel}
                    onDone={handleCropDone}
                />
            )}

            <h3>Gamertags</h3>
            {draft.gamertags.length === 0 && <p>No gamertags yet</p>}
            {draft.gamertags.map((gamertag) => (
                <div key={gamertag.id} className="gamertag-row">
                    <select
                        aria-label="Platform"
                        value={gamertag.platform}
                        onChange={(event) => updateGamertag(gamertag.id, { platform: event.target.value })}
                    >
                        {Object.keys(platformNames).map((platform) => (
                            <option key={platform} value={platform}>{platformNames[platform]}</option>
                        ))}
                        <option value="other">Other</option>
                    </select>
                    {gamertag.platform === "other" && (
                        <input
                            type="text"
                            aria-label="Platform name"
                            placeholder="Platform name"
                            value={gamertag.otherPlatform}
                            onChange={(event) => updateGamertag(gamertag.id, { otherPlatform: event.target.value })}
                        />
                    )}
                    <input
                        type="text"
                        aria-label="Gamertag"
                        placeholder="Gamertag"
                        maxLength="30"
                        value={gamertag.tag}
                        onChange={(event) => updateGamertag(gamertag.id, { tag: event.target.value })}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={gamertag.shown}
                            onChange={() => updateGamertag(gamertag.id, { shown: !gamertag.shown })}
                        />
                        {" "}Show in sidebar
                    </label>
                    <button type="button" className="button-quiet" onClick={() => removeGamertag(gamertag.id)}>
                        Remove
                    </button>
                </div>
            ))}
            <p>
                <button type="button" className="button-quiet" onClick={addGamertag}>+ Add gamertag</button>
            </p>

            <h3>Steam</h3>
            {signInResult === "failed" && (
                <p className="field-hint">Steam sign-in didn't work. Try again.</p>
            )}
            {account && account.signedIn ? (
                <div className="steam-account">
                    {account.avatarUrl && <img src={account.avatarUrl} alt="" className="steam-account-avatar" />}
                    <div>
                        <p className="steam-account-name">Signed in as {account.name || "your Steam account"}</p>
                        <p className="stat-detail">Steam ID {account.steamId}</p>
                    </div>
                    <button type="button" className="button-quiet" onClick={onSignOut}>Sign out</button>
                </div>
            ) : (
                <>
                    <p>
                        {/* A full page change, not a React route: Steam's login page is a different website */}
                        <button type="button" onClick={() => window.location.assign("/api/auth/steam")}>
                            Sign in through Steam
                        </button>
                    </p>
                    <details className="steam-id-details">
                        <summary>Or type your Steam ID</summary>
                        <div className="settings-fields">
                            <label htmlFor="steam-id">Steam ID</label>
                            <input
                                type="text"
                                id="steam-id"
                                inputMode="numeric"
                                placeholder="7656119..."
                                value={draft.steamId || ""}
                                onChange={(event) => updateDraft({ steamId: event.target.value.trim() })}
                            />
                        </div>
                    </details>
                </>
            )}
            <div className="button-row">
                <button type="button" onClick={onSyncSteam} disabled={!profile.steamId || hasChanges || isSyncing}>
                    Sync with Steam
                </button>
                {syncStatus && <span>{syncStatus}</span>}
            </div>
            <p className="stat-detail sync-note">
                Needs Steam <strong>Game details</strong> set to <strong>Public</strong> (Edit Profile → Privacy Settings).
            </p>

            <div className="button-row save-bar">
                <button type="button" onClick={() => onUpdateProfile(draft)} disabled={!hasChanges}>
                    Save profile
                </button>
                <button type="button" className="button-quiet" onClick={() => setDraft(profile)} disabled={!hasChanges}>
                    Discard changes
                </button>
                {hasChanges && <span className="unsaved-note">Unsaved changes</span>}
            </div>

            <h3>Accent color</h3>
            <p>
                {Object.keys(accentColors).map((color) => (
                    <button
                        key={color}
                        type="button"
                        className={color === accentColor ? "swatch-button selected" : "swatch-button"}
                        onClick={() => onChangeAccent(color)}
                    >
                        <span className="swatch" data-accent={color} />
                        {accentColors[color]}
                    </button>
                ))}
            </p>
            <h3>Summary sections</h3>
            <p>A section appears on the Summary page once you have a game on that platform. Untick one to hide it.</p>
            {Object.keys(platformNames).map((platform) => {
                const hasGames = games.some((game) => game.platform === platform);

                return (
                    <p key={platform}>
                        <label>
                            <input
                                type="checkbox"
                                checked={hasGames && !hiddenPlatforms.includes(platform)}
                                onChange={() => onTogglePlatform(platform)}
                                disabled={!hasGames}
                            />
                            {" "}{platformNames[platform]}
                            {!hasGames && " (no games yet)"}
                        </label>
                    </p>
                );
            })}

            <h3>Backup</h3>
            <p>
                Your games, goals, sessions, journal and settings are only saved in this browser.
                Download a backup before testing things out or clearing your browser data.
            </p>
            <div className="button-row">
                <button type="button" onClick={() => downloadBackup(onBuildBackup())}>
                    Download backup
                </button>
                <button type="button" className="button-quiet" onClick={() => restoreInputRef.current.click()}>
                    Restore from a backup
                </button>
                <input
                    ref={restoreInputRef}
                    type="file"
                    accept=".json,application/json"
                    hidden
                    onChange={handleRestoreFile}
                />
            </div>
            {restoreStatus && <p className="stat-detail">{restoreStatus}</p>}
        </section>
    );
}

export default SettingsPage;
