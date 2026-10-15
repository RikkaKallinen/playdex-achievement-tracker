import { trophyTiers } from "./data";

function AchievementCard({ achievement, onToggle, onDelete }) {
    const cardClass = achievement.earned
        ? "achievement-card unlocked"
        : "achievement-card";

    const formattedDate = achievement.earned
        ? new Date(achievement.earnedDate + "T00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
        : null;

    return (
        <article className={cardClass}>
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
            {typeof achievement.gamerscore === "number" && <p>{achievement.gamerscore}G</p>}
            {achievement.trophyTier && <p>{trophyTiers[achievement.trophyTier]} trophy</p>}
            <label>
                <input type="checkbox" checked={achievement.earned} onChange={onToggle} />
                {" "}Unlocked
            </label>
            <button onClick={onDelete}>Delete</button>
            {achievement.earned && (
                <p>
                    Unlocked on <time dateTime={achievement.earnedDate}>{formattedDate}</time>
                </p>
            )}
        </article>
    );
}

export default AchievementCard;
