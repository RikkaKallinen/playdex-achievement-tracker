import { starterGames } from "./data";
import { mergeSteamGames } from "./steamSync";
import { repairGoalLinks } from "./goalStatus";
import { useState, useEffect } from "react";
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

function App() {
    const [games, setGames] = useState([]);
    const [gamesLoaded, setGamesLoaded] = useState(false);

    useEffect(() => {
        get("playdex-games").then((savedGames) => {
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
        if (!gamesLoaded) {
            return;
        }

        set("playdex-games", games)
            .then(() => localStorage.removeItem("playdex-games"))
            .catch((error) => console.error("Couldn't save your games", error));
    }, [games, gamesLoaded]);

    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem("playdex-goals");
        return savedGoals ? JSON.parse(savedGoals) : [];
    });

    useEffect(() => {
        localStorage.setItem("playdex-goals", JSON.stringify(goals));
    }, [goals]);

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
        localStorage.setItem("playdex-sessions", JSON.stringify(sessions));
    }, [sessions]);

    const [journalEntries, setJournalEntries] = useState(() => {
        const savedEntries = localStorage.getItem("playdex-journal");
        return savedEntries ? JSON.parse(savedEntries) : [];
    });

    useEffect(() => {
        localStorage.setItem("playdex-journal", JSON.stringify(journalEntries));
    }, [journalEntries]);

    const [hiddenPlatforms, setHiddenPlatforms] = useState(() => {
        const savedHiddenPlatforms = localStorage.getItem("playdex-hidden-platforms");
        return savedHiddenPlatforms ? JSON.parse(savedHiddenPlatforms) : [];
    });

    useEffect(() => {
        localStorage.setItem("playdex-hidden-platforms", JSON.stringify(hiddenPlatforms));
    }, [hiddenPlatforms]);

    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem("playdex-accent") || "purple";
    });

    useEffect(() => {
        localStorage.setItem("playdex-accent", accentColor);
        document.documentElement.dataset.accent = accentColor;
    }, [accentColor]);

    const [fontChoice, setFontChoice] = useState(() => {
        return localStorage.getItem("playdex-font") || "default";
    });

    useEffect(() => {
        localStorage.setItem("playdex-font", fontChoice);
        document.documentElement.dataset.font = fontChoice;
    }, [fontChoice]);

    const [profile, setProfile] = useState(() => {
        const savedProfile = localStorage.getItem("playdex-profile");
        return savedProfile ? JSON.parse(savedProfile) : { name: "", avatarUrl: "", gamertags: [], steamId: "" };
    });

    useEffect(() => {
        localStorage.setItem("playdex-profile", JSON.stringify(profile));
    }, [profile]);

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

        for (let index = 0; index < steamGames.length; index++) {
            const steamGame = steamGames[index];
            setSyncStatus("Getting achievements " + (index + 1) + " of " + steamGames.length + ": " + steamGame.title);

            const achievementsResponse = await fetch("/api/steam/achievements?steamId=" + profile.steamId + "&appId=" + steamGame.steamAppId);
            if (achievementsResponse.ok) {
                const achievementData = await achievementsResponse.json();
                steamGame.achievements = achievementData.achievements;
                steamGame.stats = achievementData.stats;
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
        setSyncStatus("Synced " + steamGames.length + " games from Steam.");
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

    if (!gamesLoaded) {
        return <p className="loading-message">Loading your games…</p>;
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
