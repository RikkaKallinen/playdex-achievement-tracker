import { getPlatformText } from "./data";
import GameCover from "./GameCover";
import PlatformStat from "./PlatformStat";
import ProgressRing from "./ProgressRing";
import { countAchievements } from "./stats";

function GameCard({ game, onSelect, onDelete }) {
    const counts = countAchievements([game]);
    const percent = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

    return (
        <article className="game-card" onClick={onSelect}>
            <GameCover game={game} />
            <div className="game-info">
                <h3>{game.title}</h3>
                <p className="badge">{getPlatformText(game)}</p>
                <div className="game-progress">
                    {counts.total > 0 ? (
                        <>
                            <ProgressRing percent={percent} />
                            <span>{counts.unlocked} / {counts.total} achievements</span>
                        </>
                    ) : (
                        <span>No achievements</span>
                    )}
                </div>
                <PlatformStat game={game} />
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
