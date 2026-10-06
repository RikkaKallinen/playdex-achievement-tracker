import { starterGames } from "./data";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
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

    return (
        <>
            <header>
                <h1>Playdex</h1>
                <p>Track it. Log it. Beat it.</p>
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
                </Routes>
            </main>
        </>
    );
}

export default App;
