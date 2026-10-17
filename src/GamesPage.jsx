import { useNavigate } from "react-router";
import AddGameForm from "./AddGameForm";
import GameCard from "./GameCard";

function GamesPage({ games, onAddGame, onDeleteGame, onRestoreGame }) {
    const navigate = useNavigate();

    const activeGames = games.filter((game) => !game.deleted);
    const deletedGames = games.filter((game) => game.deleted);

    return (
        <>
            <section>
                <h2>Add a game</h2>
                <AddGameForm onAddGame={onAddGame} />
            </section>

            <section>
                <h2>See their games</h2>
                {activeGames.length === 0 && <p>No games yet</p>}
                <div className="game-grid">
                    {activeGames.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onSelect={() => navigate("/games/" + game.id)}
                            onDelete={() => onDeleteGame(game)}
                        />
                    ))}
                </div>
            </section>

            {deletedGames.length > 0 && (
                <section>
                    <h2>Deleted games</h2>
                    {deletedGames.map((game) => (
                        <p key={game.id}>
                            {game.title}{" "}
                            <button onClick={() => onRestoreGame(game.id)}>Restore</button>
                        </p>
                    ))}
                </section>
            )}
        </>
    );
}

export default GamesPage;
