import { platformNames } from "./data";
import ProgressRing from "./ProgressRing";

function GameCard({ game, onSelect, onDelete }) {
    const platformText = game.platform === "other"
        ? "Other - " + game.otherPlatform
        : platformNames[game.platform];

    const total = game.achievements.length;
    const unlocked = game.achievements.filter((achievement) => achievement.earned).length;
    const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return (
        <article className="game-card" onClick={onSelect}>
            <div className="game-cover" aria-hidden="true">
                {game.title.charAt(0)}
            </div>
            <div className="game-info">
                <h3>{game.title}</h3>
                <p className="badge">{platformText}</p>
                <div className="game-progress">
                    <ProgressRing percent={percent} />
                    <span>{unlocked} / {total} achievements</span>
                </div>
                <button
                    className="button-quiet"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete();
                    }}
                >
                    Delete
                </button>
            </div>
        </article>
    );
}

export default GameCard;
