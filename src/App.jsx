import { starterGames } from "./data";
import GameCard from "./GameCard";

function App() {
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
                        <GameCard key={game.title} game={game} />
                    ))}
                </section>

                <section>
                    <h2>Achievements</h2>
                </section>
            </main>
        </>
    );
}

export default App;
