import { starterGames } from "./data";
import { mergeSteamGames } from "./steamSync";
import { repairGoalLinks } from "./goalStatus";
import { useState, useEffect, useMemo, useRef } from "react";
import { get, set } from "idb-keyval";
import { Routes, Route } from "react-router";
import GoalsPage from "./GoalsPage";
import GamesPage from "./GamesPage";
import GamePage from "./GamePage";
import SessionPage from "./SessionPage";
import JournalPage from "./JournalPage";
import SummaryPage from "./SummaryPage";
import SettingsPage from "./SettingsPage";
import Sidebar from "./Sidebar";
import ScrollToTop from "./ScrollToTop";
import WelcomePage from "./WelcomePage";
import { useServerSave, saveAllParts } from "./useServerSave";

function App() {
    // Where your data lives:
    // "checking" until we know whether you're signed in, "browser" when signed out (the welcome page shows; this browser's
    // old copy is only kept for the one-time move), "error" when signed in but the account couldn't be loaded,
    // "choosing" when you've signed in to an empty account and we're asking whether to move this browser's data up,
    // "server" when signed in (loaded from and saved to your account)
    const [storage, setStorage] = useState("checking");
    // Set once your account's data arrives, so the slower browser copy can't overwrite it if it finishes loading later
    const loadedFromServer = useRef(false);

    const [games, setGames] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);

    useEffect(() => {
        get("playdex-games").then((savedGames) => {
            if (loadedFromServer.current) {
                return;
            }

            const oldGames = localStorage.getItem("playdex-games");
            if (savedGames) {
                setGames(savedGames);
            } else if (oldGames) {
                setGames(JSON.parse(oldGames));
            } else {
                setGames(starterGames);
            }

            setGamesLoaded(true);
        });
    }, []);

    const sortedGames = [...games].sort((a, b) => a.title.trim().localeCompare(b.title.trim(), undefined, { numeric: true }));
    const activeGames = sortedGames.filter((game) => !game.deleted);

    useEffect(() => {
        if (!gamesLoaded || storage !== "browser") {
            return;
        }

        set("playdex-games", games)
            .then(() => localStorage.removeItem("playdex-games"))
            .catch((error) => console.error("Couldn't save your games", error));
    }, [games, gamesLoaded, storage]);

    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem("playdex-goals");
        return savedGoals ? JSON.parse(savedGoals) : [];
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-goals", JSON.stringify(goals));
        }
    }, [goals, storage]);

    useEffect(() => {
        if (!gamesLoaded) {
            return;
        }

        setGoals((currentGoals) => repairGoalLinks(currentGoals, games));
    }, [games, gamesLoaded]);

    const [sessions, setSessions] = useState(() => {
        const savedSessions = localStorage.getItem("playdex-sessions");
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const activeSession = sessions.find((session) => !session.ended);
    const endedSessions = sessions.filter((session) => session.ended && !session.loggedLater);
    const lastKeptGoalIds = endedSessions.length > 0 ? endedSessions[endedSessions.length - 1].keptGoalIds || [] : [];

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-sessions", JSON.stringify(sessions));
        }
    }, [sessions, storage]);

    const [journalEntries, setJournalEntries] = useState(() => {
        const savedEntries = localStorage.getItem("playdex-journal");
        return savedEntries ? JSON.parse(savedEntries) : [];
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-journal", JSON.stringify(journalEntries));
        }
    }, [journalEntries, storage]);

    const [hiddenPlatforms, setHiddenPlatforms] = useState(() => {
        const savedHiddenPlatforms = localStorage.getItem("playdex-hidden-platforms");
        return savedHiddenPlatforms ? JSON.parse(savedHiddenPlatforms) : [];
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-hidden-platforms", JSON.stringify(hiddenPlatforms));
        }
    }, [hiddenPlatforms, storage]);

    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem("playdex-accent") || "purple";
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-accent", accentColor);
        }
        document.documentElement.dataset.accent = accentColor;
    }, [accentColor, storage]);

    const [fontChoice, setFontChoice] = useState(() => {
        return localStorage.getItem("playdex-font") || "default";
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-font", fontChoice);
        }
        document.documentElement.dataset.font = fontChoice;
    }, [fontChoice, storage]);

    const [profile, setProfile] = useState(() => {
        const savedProfile = localStorage.getItem("playdex-profile");
        return savedProfile ? JSON.parse(savedProfile) : { name: "", avatarUrl: "", gamertags: [], steamId: "" };
    });

    useEffect(() => {
        if (storage === "browser") {
            localStorage.setItem("playdex-profile", JSON.stringify(profile));
        }
    }, [profile, storage]);

    // Who's signed in through Steam: null while still asking the server, then { signedIn, steamId, name, avatarUrl }
    const [account, setAccount] = useState(null);

    // A brand-new profile from someone's Steam account, for fresh starts and accounts with no saved settings
    function freshProfile(me) {
        return { name: me.name || "", avatarUrl: me.avatarUrl || "", gamertags: [], steamId: me.steamId };
    }

    // Puts an account's saved parts on screen. Anything the account hasn't saved starts empty or at the default,
    // so nothing from this browser's copy (which may be someone else's) can ever end up in another account
    function applySavedParts(saved, me) {
        loadedFromServer.current = true;
        setGames(saved.games || []);
        setGoals(saved.goals || []);
        setSessions(saved.sessions || []);
        setJournalEntries(saved.journalEntries || []);
        const settings = saved.settings || {};
        setHiddenPlatforms(settings.hiddenPlatforms || []);
        setAccentColor(settings.accentColor || "purple");
        setFontChoice(settings.fontChoice || "default");
        setProfile(settings.profile ? { ...settings.profile, steamId: me.steamId } : freshProfile(me));
        setGamesLoaded(true);
    }

    useEffect(() => {
        // Time limits, so a slow or stuck server can never leave you on "Loading your games…" forever
        fetch("/api/auth/me", { signal: AbortSignal.timeout(8000) })
            .then((response) => (response.ok ? response.json() : { signedIn: false }))
            .catch(() => ({ signedIn: false }))
            .then(async (me) => {
                setAccount(me);
                if (!me.signedIn) {
                    setStorage("browser");
                    return;
                }

                try {
                    const response = await fetch("/api/data", { signal: AbortSignal.timeout(20000) });
                    if (!response.ok) {
                        throw new Error("Status " + response.status);
                    }
                    const saved = await response.json();

                    if (Object.keys(saved).length > 0) {
                        applySavedParts(saved, me);
                        setStorage("server");
                        return;
                    }

                    // A new account. Whose Playdex is in this browser? Its profile remembers the Steam ID it was
                    // used with, and a browser copy only ever moves into one account. If it's clearly someone
                    // else's, don't offer it at all
                    const browserProfile = JSON.parse(localStorage.getItem("playdex-profile") || "{}");
                    const movedTo = localStorage.getItem("playdex-moved-to");
                    const someoneElses = (browserProfile.steamId && browserProfile.steamId !== me.steamId)
                        || (movedTo && movedTo !== me.steamId);

                    if (someoneElses) {
                        startAccountFresh(me);
                    } else {
                        setStorage("choosing");
                    }
                } catch (error) {
                    console.error("Couldn't load your account's data", error);
                    setStorage("error");
                }
            });
    }, []);

    // A fresh page load, so everything comes back from this browser's copy instead of the account
    function signOut() {
        fetch("/api/auth/signout", { method: "POST" })
            .finally(() => window.location.reload());
    }

    // The five parts saved to your account, matching the backup file. Settings bundles the smaller bits together
    const settingsPart = useMemo(
        () => ({ hiddenPlatforms: hiddenPlatforms, accentColor: accentColor, fontChoice: fontChoice, profile: profile }),
        [hiddenPlatforms, accentColor, fontChoice, profile]
    );
    const savingToServer = storage === "server";
    useServerSave("games", games, savingToServer);
    useServerSave("goals", goals, savingToServer);
    useServerSave("sessions", sessions, savingToServer);
    useServerSave("journalEntries", journalEntries, savingToServer);
    useServerSave("settings", settingsPart, savingToServer);

    // First sign-in to an empty account: copy everything in this browser up to it
    const [isMovingData, setIsMovingData] = useState(false);
    const [moveError, setMoveError] = useState("");

    async function moveBrowserDataToAccount() {
        setIsMovingData(true);
        setMoveError("");
        try {
            const movedProfile = { ...profile, steamId: account.steamId };
            await saveAllParts({ games, goals, sessions, journalEntries, settings: { ...settingsPart, profile: movedProfile } });
            // Remember which account this browser's copy went to, so it's never offered to anyone else
            localStorage.setItem("playdex-moved-to", account.steamId);
            loadedFromServer.current = true;
            setProfile(movedProfile);
            setStorage("server");
        } catch {
            setMoveError("Something didn't save. Check the server is running and try again.");
        }
        setIsMovingData(false);
    }

    // ...or start the account completely empty: no games, default settings, a profile from your Steam account.
    // This browser's copy stays untouched either way
    function startAccountFresh(me) {
        applySavedParts({}, me);
        setStorage("server");
        // Saving settings marks the account as set up, so this question isn't asked again next time
        saveAllParts({ settings: { hiddenPlatforms: [], accentColor: "purple", fontChoice: "default", profile: freshProfile(me) } })
            .catch((error) => console.error("Couldn't save your settings", error));
    }

    function updateProfile(changes) {
        setProfile((current) => ({ ...current, ...changes }));
    }

    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState("");

    async function syncSteam() {
        setIsSyncing(true);
        setSyncStatus("Getting your Steam games...");

        const gamesResponse = await fetch("/api/steam/games?steamId=" + profile.steamId);
        if (!gamesResponse.ok) {
            setSyncStatus("Couldn't reach Steam. Check your Steam ID and that the server is running.");
            setIsSyncing(false);
            return;
        }

        const steamGames = await gamesResponse.json();
        const missingGames = games.filter((game) =>
            game.steamAppId && !steamGames.some((steamGame) => steamGame.steamAppId === game.steamAppId)
        );
        for (const game of missingGames) {
            steamGames.push({
                steamAppId: game.steamAppId,
                title: game.title,
                playtimeMinutes: game.playtimeMinutes,
                lastPlayed: game.lastPlayed,
                coverUrl: game.coverUrl,
                heroUrl: game.heroUrl
            });
        }

        // A game whose achievements fail to load keeps the ones already saved (it just gets no `achievements` here).
        // If Steam keeps refusing (it limits how many requests it takes in a short time) or the profile hides
        // game details, stop asking: games and hours played still update below
        let failedInARow = 0;
        let achievementProblem = null;

        for (let index = 0; index < steamGames.length; index++) {
            const steamGame = steamGames[index];
            setSyncStatus("Getting achievements " + (index + 1) + " of " + steamGames.length + ": " + steamGame.title);

            const achievementsResponse = await fetch("/api/steam/achievements?steamId=" + profile.steamId + "&appId=" + steamGame.steamAppId);
            if (achievementsResponse.ok) {
                failedInARow = 0;
                const achievementData = await achievementsResponse.json();
                steamGame.achievements = achievementData.achievements;
                steamGame.stats = achievementData.stats;
                continue;
            }

            failedInARow++;
            const { error } = await achievementsResponse.json().catch(() => ({}));
            if (error === "private") {
                achievementProblem = "private";
                break;
            }
            if (failedInARow >= 5) {
                achievementProblem = "busy";
                break;
            }
        }

        const gamesNeedingGenres = steamGames.filter((steamGame) => {
            const playdexGame = games.find((game) => game.steamAppId === steamGame.steamAppId);
            return !playdexGame || !playdexGame.genres;
        });

        for (let index = 0; index < gamesNeedingGenres.length; index += 25) {
            const chunk = gamesNeedingGenres.slice(index, index + 25);
            setSyncStatus("Getting genres " + Math.min(index + 25, gamesNeedingGenres.length) + " of " + gamesNeedingGenres.length);

            const genresResponse = await fetch("/api/steam/genres?appIds=" + chunk.map((steamGame) => steamGame.steamAppId).join(","));
            if (genresResponse.ok) {
                const genres = await genresResponse.json();
                for (const steamGame of chunk) {
                    if (genres[steamGame.steamAppId]) {
                        steamGame.genres = genres[steamGame.steamAppId];
                    }
                }
            }
        }

        setGames((currentGames) => mergeSteamGames(currentGames, steamGames));
        if (achievementProblem === "private") {
            setSyncStatus("Synced " + steamGames.length + " games, but Steam keeps this profile's achievements private. "
                + "In Steam, go to Edit Profile → Privacy Settings and set Game details to Public, then sync again.");
        } else if (achievementProblem === "busy") {
            setSyncStatus("Synced " + steamGames.length + " games, but Steam is limiting requests right now, so achievements "
                + "weren't updated (your saved ones are kept). Try syncing again in an hour or so.");
        } else {
            setSyncStatus("Synced " + steamGames.length + " games from Steam.");
        }
        setIsSyncing(false);
    }

    function toggleAchievement(gameId, achievementName) {
        setGames(games.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return {
                ...game,
                achievements: game.achievements.map((achievement) => {
                    if (achievement.name !== achievementName) {
                        return achievement;
                    }

                    const nowEarned = !achievement.earned;
                    let earnedDate = achievement.earnedDate;
                    if (nowEarned && !earnedDate) {
                        earnedDate = new Date().toLocaleDateString("en-CA");
                    }

                    return { ...achievement, earned: nowEarned, earnedDate: earnedDate };
                })
            };
        }));
    }

    function addGame(newGame) {
        setGames([...games, newGame]);
    }

    function addAchievement(gameId, newAchievement) {
        setGames(games.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return { ...game, achievements: [...game.achievements, newAchievement] };
        }));
    }

    function deleteGame(gameToDelete) {
        if (!confirm("Delete " + gameToDelete.title + "? You can restore it from Deleted games on the Games page.")) {
            return;
        }

        setGames(games.map((game) => {
            if (game.id !== gameToDelete.id) {
                return game;
            }

            return { ...game, deleted: true };
        }));
    }

    function restoreGame(gameId) {
        setGames(games.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return { ...game, deleted: false };
        }));
    }

    function updateGameCover(gameId, coverUrl) {
        setGames(games.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return { ...game, coverUrl: coverUrl };
        }));
    }

    function updateGame(gameId, changes) {
        setGames((currentGames) => currentGames.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return { ...game, ...changes };
        }));
    }

    function deleteAchievement(gameId, achievementName) {
        setGames(games.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return {
                ...game,
                achievements: game.achievements.filter((achievement) => achievement.name !== achievementName)
            };
        }));
    }

    function updateAchievement(gameId, achievementName, changes) {
        setGames((currentGames) => currentGames.map((game) => {
            if (game.id !== gameId) {
                return game;
            }

            return {
                ...game,
                achievements: game.achievements.map((achievement) => {
                    if (achievement.name !== achievementName) {
                        return achievement;
                    }

                    return { ...achievement, ...changes };
                })
            };
        }));
    }

    function addGoal(newGoal) {
        setGoals([...goals, newGoal]);
    }

    function toggleGoal(goalId) {
        const goalToToggle = goals.find((goal) => goal.id === goalId);
        if (goalToToggle.type === "achievement") {
            const goalGame = games.find((game) => game.id === goalToToggle.gameId);
            const linkedAchievement = goalGame?.achievements.find((achievement) => achievement.name === goalToToggle.achievementName);
            if (linkedAchievement?.source === "steam") {
                alert("This achievement will update after your next Steam sync.");
                return;
            }

            toggleAchievement(goalToToggle.gameId, goalToToggle.achievementName);
            return;
        }

        setGoals(goals.map((goal) => {
            if (goal.id !== goalId) {
                return goal;
            }

            const nowCompleted = !goal.completed;
            const completedDate = nowCompleted
                ? new Date().toLocaleDateString("en-CA")
                : null;

            return { ...goal, completed: nowCompleted, completedDate: completedDate };
        }));
    }

    // changes holds only the fields the edit form touched, e.g. { text, gameId, target, tags }
    function updateGoal(goalId, changes) {
        setGoals((currentGoals) => currentGoals.map((goal) => (goal.id === goalId ? { ...goal, ...changes } : goal)));
    }

    function deleteGoal(goalId) {
        setGoals(goals.filter((goal) => goal.id !== goalId));
    }

    function updateGoalProgress(goalId, newProgress) {
        setGoals(goals.map((goal) => {
            if (goal.id !== goalId) {
                return goal;
            }

            const nowCompleted = newProgress >= goal.target;
            let completedDate = null;
            if (nowCompleted) {
                completedDate = goal.completed
                    ? goal.completedDate
                    : new Date().toLocaleDateString("en-CA");
            }

            return { ...goal, progress: newProgress, completed: nowCompleted, completedDate: completedDate };
        }));
    }

    function startSession(goalIds, gameIds) {
        setSessions([...sessions, {
            id: crypto.randomUUID(),
            startedDate: new Date().toLocaleDateString("en-CA"),
            startedAt: Date.now(),
            goalIds: goalIds,
            gameIds: gameIds,
            ended: false,
            endedDate: null
        }]);
    }

    function updateActiveSession(changeSession) {
        setSessions((currentSessions) => currentSessions.map((session) => {
            if (session.ended) {
                return session;
            }

            return changeSession(session);
        }));
    }

    function pauseSession() {
        updateActiveSession((session) => (session.pausedAt ? session : { ...session, pausedAt: Date.now() }));
    }

    function resumeSession() {
        updateActiveSession((session) => {
            if (!session.pausedAt) {
                return session;
            }

            return {
                ...session,
                pausedMs: (session.pausedMs || 0) + (Date.now() - session.pausedAt),
                pausedAt: null
            };
        });
    }

    function addGoalToSession(goalId) {
        updateActiveSession((session) => ({ ...session, goalIds: [...session.goalIds, goalId] }));
    }

    function addGameToSession(gameId) {
        updateActiveSession((session) => ({ ...session, gameIds: [...(session.gameIds || []), gameId] }));
    }

    function removeGameFromSession(gameId) {
        updateActiveSession((session) => ({
            ...session,
            gameIds: (session.gameIds || []).filter((id) => id !== gameId)
        }));
    }

    function addNewSessionGoal(newGoal) {
        setGoals((currentGoals) => [...currentGoals, newGoal]);
        addGoalToSession(newGoal.id);
    }

    function logPastSession(newSession) {
        setSessions((currentSessions) => [...currentSessions, newSession]);
    }

    function addSessionNote(sessionId, note) {
        setSessions((currentSessions) => currentSessions.map((session) => {
            if (session.id !== sessionId) {
                return session;
            }

            const gameIds = session.gameIds || [];
            return {
                ...session,
                gameIds: gameIds.includes(note.gameId) ? gameIds : [...gameIds, note.gameId],
                summaries: [...(session.summaries || []), note]
            };
        }));
    }

    function deleteSession(sessionId) {
        setSessions((currentSessions) => currentSessions.filter((session) => session.id !== sessionId));
    }

    function endSession(keptGoalIds, summaries) {
        updateActiveSession((session) => ({
            ...session,
            pausedMs: (session.pausedMs || 0) + (session.pausedAt ? Date.now() - session.pausedAt : 0),
            pausedAt: null,
            ended: true,
            endedDate: new Date().toLocaleDateString("en-CA"),
            endedAt: Date.now(),
            keptGoalIds: keptGoalIds,
            summaries: summaries
        }));
    }

    function addJournalEntry(gameId, newEntry) {
        setJournalEntries([...journalEntries, { ...newEntry, gameId: gameId }]);
    }

    function deleteJournalEntry(entryId) {
        setJournalEntries(journalEntries.filter((entry) => entry.id !== entryId));
    }

    // Saving an empty entry removes it
    function updateJournalEntry(entryId, text) {
        setJournalEntries((currentEntries) => (text
            ? currentEntries.map((entry) => (entry.id === entryId ? { ...entry, text: text } : entry))
            : currentEntries.filter((entry) => entry.id !== entryId)));
    }

    // texts lines up with session.summaries; an emptied note is removed
    function updateSessionSummaries(sessionId, texts) {
        setSessions((currentSessions) => currentSessions.map((session) => {
            if (session.id !== sessionId) {
                return session;
            }

            return {
                ...session,
                summaries: session.summaries
                    .map((summary, index) => ({ ...summary, text: texts[index] }))
                    .filter((summary) => summary.text)
            };
        }));
    }

    // Everything Playdex keeps in this browser, bundled into one object for Settings → Backup
    function buildBackup() {
        return {
            app: "playdex",
            version: 1,
            savedAt: new Date().toLocaleDateString("en-CA"),
            games: games,
            goals: goals,
            sessions: sessions,
            journalEntries: journalEntries,
            hiddenPlatforms: hiddenPlatforms,
            accentColor: accentColor,
            fontChoice: fontChoice,
            profile: profile
        };
    }

    // Replaces everything with the backup's copy. The save effects above then write it to the browser as usual
    function restoreBackup(backup) {
        setGames(backup.games);
        setGoals(backup.goals);
        setSessions(backup.sessions);
        setJournalEntries(backup.journalEntries);
        setHiddenPlatforms(backup.hiddenPlatforms || []);
        setAccentColor(backup.accentColor || accentColor);
        setFontChoice(backup.fontChoice || fontChoice);
        if (backup.profile) {
            setProfile(backup.profile);
        }
    }

    function togglePlatform(platform) {
        if (hiddenPlatforms.includes(platform)) {
            setHiddenPlatforms(hiddenPlatforms.filter((hiddenPlatform) => hiddenPlatform !== platform));
        } else {
            setHiddenPlatforms([...hiddenPlatforms, platform]);
        }
    }

    // Signed out: the welcome page. Steam sends failed sign-ins back with ?signin=failed
    if (storage === "browser") {
        return <WelcomePage signInFailed={new URLSearchParams(window.location.search).get("signin") === "failed"} />;
    }

    if (!gamesLoaded || storage === "checking") {
        return <p className="loading-message">Loading your games…</p>;
    }

    if (storage === "error") {
        return (
            <main className="move-data">
                <h2>Couldn't load your Playdex</h2>
                <p>Your account didn't answer in time. Check the server is running, then try again.</p>
                <div className="button-row">
                    <button type="button" onClick={() => window.location.reload()}>Try again</button>
                    <button type="button" className="button-quiet" onClick={signOut}>Sign out</button>
                </div>
            </main>
        );
    }

    if (storage === "choosing") {
        return (
            <main className="move-data">
                <h2>Welcome, {(account && account.name) || "player"}</h2>
                <p>Your account is new. This browser already has a Playdex saved in it:</p>
                <div className="move-data-owner">
                    {profile.avatarUrl && <img src={profile.avatarUrl} alt="" />}
                    <div>
                        <p className="steam-account-name">{profile.name || "No name set"}</p>
                        <p className="stat-detail">
                            {games.filter((game) => !game.deleted).length} games, {goals.length} goals,
                            {" "}{sessions.length} sessions, {journalEntries.length} journal entries
                        </p>
                    </div>
                </div>
                <p><strong>Is this yours?</strong> Only move it if it is. It can only be moved into one account.</p>
                <div className="button-row">
                    <button type="button" onClick={moveBrowserDataToAccount} disabled={isMovingData}>
                        {isMovingData ? "Moving…" : "Yes, move it to my account"}
                    </button>
                    <button type="button" className="button-quiet" onClick={() => startAccountFresh(account)} disabled={isMovingData}>
                        No, start fresh
                    </button>
                </div>
                {moveError && <p className="field-hint">{moveError}</p>}
            </main>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar games={activeGames} profile={profile} goals={goals} activeSession={activeSession} />

            <main>
                <ScrollToTop />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <GamesPage
                                games={sortedGames}
                                onAddGame={addGame}
                                onDeleteGame={deleteGame}
                                onRestoreGame={restoreGame}
                            />
                        }
                    />
                    <Route
                        path="/games/:gameId"
                        element={
                            <GamePage
                                games={sortedGames}
                                onAddAchievement={addAchievement}
                                onToggleAchievement={toggleAchievement}
                                onDeleteAchievement={deleteAchievement}
                                onUpdateAchievement={updateAchievement}
                                onUpdateGameCover={updateGameCover}
                                onUpdateGame={updateGame}
                                goals={goals}
                                sessions={sessions}
                                journalEntries={journalEntries}
                                onAddJournalEntry={addJournalEntry}
                                onDeleteJournalEntry={deleteJournalEntry}
                                onUpdateJournalEntry={updateJournalEntry}
                                onDeleteSession={deleteSession}
                                onAddSessionNote={addSessionNote}
                                onUpdateSessionSummaries={updateSessionSummaries}
                                onDeleteGoal={deleteGoal}
                            />
                        }
                    />
                    <Route
                        path="/goals"
                        element={
                            <GoalsPage
                                goals={goals}
                                games={sortedGames}
                                onAddGoal={addGoal}
                                onToggleGoal={toggleGoal}
                                onDeleteGoal={deleteGoal}
                                onUpdateGoalProgress={updateGoalProgress}
                                onUpdateGoal={updateGoal}
                            />
                        }
                    />
                    <Route
                        path="/session"
                        element={
                            <SessionPage
                                goals={goals}
                                games={sortedGames}
                                activeSession={activeSession}
                                lastKeptGoalIds={lastKeptGoalIds}
                                onStartSession={startSession}
                                onEndSession={endSession}
                                onPauseSession={pauseSession}
                                onResumeSession={resumeSession}
                                onAddGoalToSession={addGoalToSession}
                                onAddGameToSession={addGameToSession}
                                onRemoveGameFromSession={removeGameFromSession}
                                onAddNewGoal={addNewSessionGoal}
                                onToggleGoal={toggleGoal}
                                onDeleteGoal={deleteGoal}
                                onUpdateGoalProgress={updateGoalProgress}
                                onUpdateGoal={updateGoal}
                            />
                        }
                    />
                    <Route
                        path="/journal"
                        element={
                            <JournalPage
                                games={sortedGames}
                                goals={goals}
                                sessions={sessions}
                                journalEntries={journalEntries}
                                onDeleteSession={deleteSession}
                                onAddEntry={addJournalEntry}
                                onLogPastSession={logPastSession}
                                onAddSessionNote={addSessionNote}
                                onUpdateAchievement={updateAchievement}
                                onDeleteEntry={deleteJournalEntry}
                                onUpdateEntry={updateJournalEntry}
                                onUpdateSessionSummaries={updateSessionSummaries}
                                onDeleteGoal={deleteGoal}
                            />
                        }
                    />
                    <Route
                        path="/summary"
                        element={<SummaryPage games={activeGames} goals={goals} sessions={sessions} hiddenPlatforms={hiddenPlatforms} />}
                    />
                    <Route
                        path="/settings"
                        element={
                            <SettingsPage
                                key={profile.steamId || "no-steam-id"}
                                account={account}
                                onSignOut={signOut}
                                games={activeGames}
                                hiddenPlatforms={hiddenPlatforms}
                                onTogglePlatform={togglePlatform}
                                accentColor={accentColor}
                                onChangeAccent={setAccentColor}
                                fontChoice={fontChoice}
                                onChangeFont={setFontChoice}
                                profile={profile}
                                onUpdateProfile={updateProfile}
                                onSyncSteam={syncSteam}
                                isSyncing={isSyncing}
                                syncStatus={syncStatus}
                                onBuildBackup={buildBackup}
                                onRestoreBackup={restoreBackup}
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
