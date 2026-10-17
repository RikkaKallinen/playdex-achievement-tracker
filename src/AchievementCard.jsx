import { trophyTiers } from "./data";
import { formatDate } from "./formatDate";

function AchievementCard({ achievement, onToggle, onDelete, onUpdate }) {
    const cardClass = achievement.earned
        ? "achievement-card unlocked"
        : "achievement-card";

    const iconClass = achievement.trophyTier
        ? "achievement-icon tier-" + achievement.trophyTier
        : "achievement-icon";

    let icon = achievement.earned ? "🏆" : "🔒";
    if (achievement.iconUrl) {
        icon = <img src={achievement.iconUrl} alt="" />;
    }

    return (
        <article className={cardClass}>
            <div className={iconClass} aria-hidden="true">
                {icon}
            </div>

            <div className="achievement-body">
                <div className="achievement-header">
                    <h3>{achievement.name}</h3>
                    {achievement.trophyTier && (
                        <span className={"badge trophy-badge tier-" + achievement.trophyTier}>
                            {trophyTiers[achievement.trophyTier]}
                        </span>
                    )}
                    {typeof achievement.gamerscore === "number" && (
                        <span className="gamerscore">
                            {achievement.gamerscore}<span className="unit"> G</span>
                        </span>
                    )}
                </div>

                {achievement.description && (
                    <p className="achievement-description">{achievement.description}</p>
                )}

                <p className="achievement-date">
                    {achievement.earned ? (
                        <>✓ Unlocked <time dateTime={achievement.earnedDate}>{formatDate(achievement.earnedDate)}</time></>
                    ) : (
                        "Not unlocked yet"
                    )}
                </p>


                {achievement.notes && (
                    <p className="achievement-note"><em>Note:</em> {achievement.notes}</p>
                )}

                <div className="achievement-actions">
                    <label>
                        <input type="checkbox" checked={achievement.earned} onChange={onToggle} />
                        {" "}Unlocked
                    </label>
                    <button className="button-quiet" onClick={onDelete}>Delete</button>
                </div>

                <details>
                    <summary>Note &amp; icon</summary>
                    <label htmlFor={"note-" + achievement.name}>Note</label>
                    <textarea
                        id={"note-" + achievement.name}
                        rows="3"
                        value={achievement.notes || ""}
                        onChange={(event) => onUpdate({ notes: event.target.value })}
                    />
                    <label htmlFor={"icon-" + achievement.name}>Icon image link</label>
                    <input
                        type="url"
                        id={"icon-" + achievement.name}
                        placeholder="https://..."
                        value={achievement.iconUrl || ""}
                        onChange={(event) => onUpdate({ iconUrl: event.target.value })}
                    />
                </details>
            </div>
        </article>
    );
}

export default AchievementCard;
