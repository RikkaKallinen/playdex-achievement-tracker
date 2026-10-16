import { starterGames } from "./data";
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router";
import GoalsPage from "./GoalsPage";
import GamesPage from "./GamesPage";
import GamePage from "./GamePage";
import SessionPage from "./SessionPage";
import SummaryPage from "./SummaryPage";
import SettingsPage from "./SettingsPage";

function App() {
    const [games, setGames] = useState(() => {
        const savedGames = localStorage.getItem("playdex-games");
        return savedGames ? JSON.parse(savedGames) : starterGames;
    });

    const activeGames = games.filter((game) => !game.deleted);

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

    function updateAchievementNotes(gameId, achievementName, notes) {
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

                    return { ...achievement, notes: notes };
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
        <>
            <header>
                <h1>Playdex</h1>
                <p>Track it. Log it. Beat it.</p>
                <nav>
                    <Link to="/">Games</Link>
                    {" "}
                    <Link to="/goals">Goals</Link>
                    {" "}
                    <Link to="/session">Session</Link>
                    {" "}
                    <Link to="/summary">Summary</Link>
                    {" "}
                    <Link to="/settings">Settings</Link>
                </nav>
            </header>
            <main>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <GamesPage
                                games={games}
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
                                games={games}
                                onAddAchievement={addAchievement}
                                onToggleAchievement={toggleAchievement}
                                onDeleteAchievement={deleteAchievement}
                                onUpdateAchievementNotes={updateAchievementNotes}
                                goals={goals}
                                sessions={sessions}
                                journalEntries={journalEntries}
                                onAddJournalEntry={addJournalEntry}
                                onDeleteJournalEntry={deleteJournalEntry}
                            />
                        }
                    />
                    <Route
                        path="/goals"
                        element={
                            <GoalsPage
                                goals={goals}
                                games={games}
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
                                games={games}
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
                            />
                        }
                    />
                </Routes>
            </main>
        </>
    );
}

export default App;
