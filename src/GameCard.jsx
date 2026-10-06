import { platformNames } from "./data";

function GameCard({ game, onSelect, onDelete }) {
    const platformText = game.platform === "other"
        ? "Other - " + game.otherPlatform
        : platformNames[game.platform];

    return (
        <article className="game-card" onClick={onSelect}>
            <h3>{game.title}</h3>
            <p>{platformText}</p>
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                }}
            >
                Delete
            </button>
        </article>
    );
}

export default GameCard;