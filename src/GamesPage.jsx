import { useNavigate } from "react-router";
import AddGameForm from "./AddGameForm";
import GameCard from "./GameCard";

function GamesPage({ games, onAddGame, onDeleteGame }) {
    const navigate = useNavigate();

    return (
        <>
            <section>
                <h2>Add a game</h2>
                <AddGameForm onAddGame={onAddGame} />
            </section>

            <section>
                <h2>See their games</h2>
                {games.length === 0 && <p>No games yet</p>}
                {games.map((game) => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onSelect={() => navigate("/games/" + game.id)}
                        onDelete={() => onDeleteGame(game)}
                    />
                ))}
            </section>
        </>
    );
}

export default GamesPage;
