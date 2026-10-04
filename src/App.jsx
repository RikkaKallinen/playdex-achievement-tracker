import { starterGames } from "./data";
import GameCard from "./GameCard";
import { useState } from "react";

function App() {
    const [selectedGameId, setSelectedGameId] = useState(starterGames[0].id);
    const selectedGame = starterGames.find((game) => game.id === selectedGameId);

    return (
        <>
            <header>
                <h1>Playdex</h1>
                <p>Track it. Log it. Beat it.</p>
            </header>
            <main>
                <section>
                    <h2>Add a game</h2>
                </section>

                <section>
                    <h2>See their games</h2>
                    {starterGames.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onSelect={() => setSelectedGameId(game.id)}
                        />
                    ))}
                </section>

                <section>
                    <h2>{selectedGame.title}</h2>
                </section>
            </main>
        </>
    );
}

export default App;
