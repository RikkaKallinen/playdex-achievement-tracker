import { trophyTiers } from "./data";

function AchievementCard({ achievement, onToggle, onDelete, onNotesChange }) {
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
            {achievement.notes && <p><em>Note:</em> {achievement.notes}</p>}
            <details>
                <summary>{achievement.notes ? "Edit note" : "Add a note"}</summary>
                <textarea
                    rows="3"
                    value={achievement.notes || ""}
                    onChange={(event) => onNotesChange(event.target.value)}
                />
            </details>
        </article>
    );
}

export default AchievementCard;
