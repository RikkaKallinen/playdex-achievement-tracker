import { starterGames } from "./data";
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router";
import GoalsPage from "./GoalsPage";
import GamesPage from "./GamesPage";
import GamePage from "./GamePage";

function App() {
    const [games, setGames] = useState(() => {
        const savedGames = localStorage.getItem("playdex-games");
        return savedGames ? JSON.parse(savedGames) : starterGames;
    });

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
        if (!confirm("Delete " + gameToDelete.title + " and all its achievements?")) {
            return;
        }

        setGames(games.filter((game) => game.id !== gameToDelete.id));
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

    function addGoal(newGoal) {
        setGoals([...goals, newGoal]);
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
                            />
                        }
                    />
                </Routes>
            </main>
        </>
    );
}

export default App;
