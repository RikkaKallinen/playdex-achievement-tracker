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
    const [selectedGameId, setSelectedGameId] = useState(games[0].id);
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
                    {games.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onSelect={() => setSelectedGameId(game.id)}
                        />
                    ))}
                </section>

                <section>
                    <h2>{selectedGame.title}</h2>
                    <AddAchievementForm onAddAchievement={addAchievement} />
                    {selectedGame.achievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.name}
                            achievement={achievement}
                            onToggle={() => toggleAchievement(achievement.name)}
                        />
                    ))}
                </section>
            </main>
        </>
    );
}

export default App;
