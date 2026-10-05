import { starterGames } from "./data";
import GameCard from "./GameCard";
import { useState } from "react";
import AchievementCard from "./AchievementCard";
import AddGameForm from "./AddGameForm";

function App() {
    const [games, setGames] = useState(starterGames);
    const [selectedGameId, setSelectedGameId] = useState(starterGames[0].id);
    const selectedGame = games.find((game) => game.id === selectedGameId);

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
