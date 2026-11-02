import { trophyTiers } from "./data";
import { formatDate } from "./formatDate";
import { cleanDescription, formatRarity } from "./summaryStats";

function AchievementCard({ achievement, highlighted, onToggle, onDelete, onUpdate }) {
    const isSynced = achievement.source === "steam";
    const showProgress = !achievement.earned && achievement.progressStat && achievement.progressTarget > 0;
    const progressPercent = showProgress
        ? Math.min(100, Math.round((achievement.progressValue / achievement.progressTarget) * 100))
        : 0;

    const cardClass = "achievement-card"
        + (achievement.earned ? " unlocked" : "")
        + (highlighted ? " highlighted" : "");

    const iconClass = achievement.trophyTier
        ? "achievement-icon tier-" + achievement.trophyTier
        : "achievement-icon";

    let icon = achievement.earned ? "🏆" : "🔒";
    if (achievement.iconUrl) {
        icon = <img src={achievement.iconUrl} alt="" />;
    }

    return (
        <article className={cardClass} id={"achievement-" + achievement.name}>
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
                    <p className="achievement-description">{cleanDescription(achievement.description)}</p>
                )}

                <p className="achievement-date">
                    {achievement.earned ? (
                        <>✓ Unlocked <time dateTime={achievement.earnedDate}>{formatDate(achievement.earnedDate)}</time></>
                    ) : (
                        "Not unlocked yet"
                    )}
                    {formatRarity(achievement.rarity) && (
                        <span className="achievement-rarity"> · {formatRarity(achievement.rarity)}</span>
                    )}
                    {showProgress && (
                        <span className="achievement-progress">
                            <span className="stat-bar">
                                <span className="stat-bar-fill" style={{ width: progressPercent + "%" }} />
                            </span>
                            {achievement.progressValue} / {achievement.progressTarget}
                        </span>
                    )}
                </p>

                {achievement.notes && (
                    <p className="achievement-note"><em>Note:</em> {achievement.notes}</p>
                )}

                <div className="achievement-actions">
                    {isSynced ? (
                        <span className="synced-note">Synced from Steam</span>
                    ) : (
                        <>
                            <label>
                                <input type="checkbox" checked={achievement.earned} onChange={onToggle} />
                                {" "}Unlocked
                            </label>
                            <button className="button-quiet" onClick={onDelete}>Delete</button>
                        </>
                    )}
                    {!isSynced && (
                        <details className="achievement-edit">
                            <summary>Edit</summary>
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
                    )}
                </div>
            </div>
        </article>
    );
}

export default AchievementCard;
