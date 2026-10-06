import { starterGames } from "./data";
import GameCard from "./GameCard";
import AchievementCard from "./AchievementCard";
import AddGameForm from "./AddGameForm";
import AddAchievementForm from "./AddAchievementForm";
import { useState, useEffect } from "react";

function App() {
    const [games, setGames] = useState(() => {
        const savedGames = localStorage.getItem("playdex-games");
        return savedGames ? JSON.parse(savedGames) : starterGames;
    });
    const [selectedGameId, setSelectedGameId] = useState(games.length > 0 ? games[0].id : null);
    const selectedGame = games.find((game) => game.id === selectedGameId);

    useEffect(() => {
        localStorage.setItem("playdex-games", JSON.stringify(games));
    }, [games]);

    function toggleAchievement(achievementName) {
        setGames(games.map((game) => {
            if (game.id !== selectedGameId) {
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

    function addAchievement(newAchievement) {
        setGames(games.map((game) => {
            if (game.id !== selectedGameId) {
                return game;
            }

            return { ...game, achievements: [...game.achievements, newAchievement] };
        }));
    }

    function deleteGame(gameToDelete) {
        if(!confirm("Delete " + gameToDelete.title + " and all its achievements?")) {
            return;
        }

        const remainingGames = games.filter((game) => game.id !== gameToDelete.id);
        setGames(remainingGames);

        if (selectedGameId === gameToDelete.id) {
            setSelectedGameId(remainingGames.length > 0 ? remainingGames[0].id : null);
        }
    }

    function deleteAchievement(achievementName) {
        setGames(games.map((game) => {
            if(game.id !== selectedGameId) {
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
                <section>
                    <h2>Add a game</h2>
                    <AddGameForm onAddGame={addGame} />
                </section>

                <section>
                    <h2>See their games</h2>
                    {games.length === 0 && <p>No games yet</p>}
                    {games.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onSelect={() => setSelectedGameId(game.id)}
                            onDelete={() => deleteGame(game)}
                        />
                    ))}
                </section>

                {selectedGame && (
                    <section>
                        <h2>{selectedGame.title}</h2>
                        <AddAchievementForm onAddAchievement={addAchievement} />
                        {selectedGame.achievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.name}
                                achievement={achievement}
                                onToggle={() => toggleAchievement(achievement.name)}
                                onDelete={() => deleteAchievement(achievement.name)}
                            />
                        ))}
                    </section>
                )}
            </main>
        </>
    );
}

export default App;
