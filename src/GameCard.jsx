import { platformNames } from "./data";
import ProgressRing from "./ProgressRing";
import { countGamerscore, countTrophies } from "./stats";

function GameCard({ game, onSelect, onDelete }) {
    const platformText = game.platform === "other"
        ? "Other - " + game.otherPlatform
        : platformNames[game.platform];

    const total = game.achievements.length;
    const unlocked = game.achievements.filter((achievement) => achievement.earned).length;
    const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    const gamerscore = countGamerscore([game]);
    const trophies = countTrophies([game]);

    return (
        <article className="game-card" onClick={onSelect}>
            <div className="game-cover" aria-hidden="true">
                {game.coverUrl ? <img src={game.coverUrl} alt="" /> : game.title.charAt(0)}
            </div>
            <div className="game-info">
                <h3>{game.title}</h3>
                <p className="badge">{platformText}</p>
                <div className="game-progress">
                    <ProgressRing percent={percent} />
                    <span>{unlocked} / {total} achievements</span>
                </div>
                {game.platform === "xbox" && (
                    <p className="tile-gamerscore">
                        {gamerscore.earned}<span className="unit"> / {gamerscore.total} G</span>
                    </p>
                )}
                {game.platform === "playstation" && (
                    <ul className="trophy-counts">
                        {trophies.map((trophy) => (
                            <li
                                key={trophy.tier}
                                className={"trophy-count tier-" + trophy.tier}
                                title={trophy.name}
                                aria-label={trophy.name + ": " + trophy.count}
                            >
                                <span className="trophy-dot" />
                                {trophy.count}
                            </li>
                        ))}
                    </ul>
                )}
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
