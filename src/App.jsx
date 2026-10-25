import { starterGames } from "./data";
import { mergeSteamGames } from "./steamSync";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import GoalsPage from "./GoalsPage";
import GamesPage from "./GamesPage";
import GamePage from "./GamePage";
import SessionPage from "./SessionPage";
import SummaryPage from "./SummaryPage";
import SettingsPage from "./SettingsPage";
import Sidebar from "./Sidebar";

function App() {
    const [games, setGames] = useState(() => {
        const savedGames = localStorage.getItem("playdex-games");
        return savedGames ? JSON.parse(savedGames) : starterGames;
    });

    const sortedGames = [...games].sort((a, b) => a.title.trim().localeCompare(b.title.trim(), undefined, { numeric: true }));
    const activeGames = sortedGames.filter((game) => !game.deleted);

    useEffect(() => {
        localStorage.setItem("playdex-games", JSON.stringify(games));
    }, [games]);

    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem("playdex-goals");
        return savedGoals ? JSON.parse(savedGoals) : [];
    });

    useEffect(() => {
        localStorage.setItem("playdex-goals", JSON.stringify(goals));
    }, [goals]);

    const [sessions, setSessions] = useState(() => {
        const savedSessions = localStorage.getItem("playdex-sessions");
        return savedSessions ? JSON.parse(savedSessions) : [];
    });
    const activeSession = sessions.find((session) => !session.ended);
    const endedSessions = sessions.filter((session) => session.ended);
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
        const playedGames = steamGames.filter((steamGame) => steamGame.playtimeMinutes > 0);

        for (let index = 0; index < playedGames.length; index++) {
            const steamGame = playedGames[index];
            setSyncStatus("Getting achievements " + (index + 1) + " of " + playedGames.length + ": " + steamGame.title);

            const achievementsResponse = await fetch("/api/steam/achievements?steamId=" + profile.steamId + "&appId=" + steamGame.steamAppId);
            if (achievementsResponse.ok) {
                const achievementData = await achievementsResponse.json();
                steamGame.achievements = achievementData.achievements;
                steamGame.stats = achievementData.stats;
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

    function startSession(goalIds) {
        setSessions([...sessions, {
            id: crypto.randomUUID(),
            startedDate: new Date().toLocaleDateString("en-CA"),
            goalIds: goalIds,
            ended: false,
            endedDate: null
        }]);
    }

    function endSession(keptGoalIds, summaries) {
        setSessions(sessions.map((session) => {
            if (session.id !== activeSession.id) {
                return session;
            }

            return {
                ...session,
                ended: true,
                endedDate: new Date().toLocaleDateString("en-CA"),
                keptGoalIds: keptGoalIds,
                summaries: summaries
            };
        }));
    }

    function addJournalEntry(gameId, newEntry) {
        setJournalEntries([...journalEntries, { ...newEntry, gameId: gameId }]);
    }

    function deleteJournalEntry(entryId) {
        setJournalEntries(journalEntries.filter((entry) => entry.id !== entryId));
    }

    function togglePlatform(platform) {
        if (hiddenPlatforms.includes(platform)) {
            setHiddenPlatforms(hiddenPlatforms.filter((hiddenPlatform) => hiddenPlatform !== platform));
        } else {
            setHiddenPlatforms([...hiddenPlatforms, platform]);
        }
    }

    return (
        <div className="app-layout">
            <Sidebar games={activeGames} profile={profile} />

            <main>
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
                                goals={goals}
                                sessions={sessions}
                                journalEntries={journalEntries}
                                onAddJournalEntry={addJournalEntry}
                                onDeleteJournalEntry={deleteJournalEntry}
                                steamId={profile.steamId}
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
                                onToggleGoal={toggleGoal}
                                onDeleteGoal={deleteGoal}
                                onUpdateGoalProgress={updateGoalProgress}
                            />
                        }
                    />
                    <Route
                        path="/summary"
                        element={<SummaryPage games={activeGames} hiddenPlatforms={hiddenPlatforms} />}
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
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
