import { useState } from "react";
import { platformNames, accentColors, fontOptions } from "./data";
import { cropImage } from "./resizeImage";
import AvatarCropper from "./AvatarCropper";

function SettingsPage({ games, hiddenPlatforms, onTogglePlatform, accentColor, onChangeAccent, fontChoice, onChangeFont, profile, onUpdateProfile }) {
    const [draft, setDraft] = useState(profile);
    const [cropSource, setCropSource] = useState(null);

    const hasChanges = JSON.stringify(draft) !== JSON.stringify(profile);

    function updateDraft(changes) {
        setDraft((current) => ({ ...current, ...changes }));
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
                    {draft.avatarUrl
                        ? <img src={draft.avatarUrl} alt="" />
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
                            Remove avatar
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
            <h3>Font</h3>
            <p>
                {Object.keys(fontOptions).map((font) => (
                    <button
                        key={font}
                        type="button"
                        data-font={font}
                        className={font === fontChoice ? "swatch-button font-preview selected" : "swatch-button font-preview"}
                        onClick={() => onChangeFont(font)}
                    >
                        {fontOptions[font]}
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
        </section>
    );
}

export default SettingsPage;
