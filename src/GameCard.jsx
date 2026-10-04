import { platformNames } from "./data";

function GameCard({ game, onSelect }) {
    const platformText = game.platform === "other"
        ? "Other - " + game.otherPlatform
        : platformNames[game.platform];

    return (
        <article className="game-card" onClick={onSelect}>
            <h3>{game.title}</h3>
            <p>{platformText}</p>
        </article>
    );
}

export default GameCard;