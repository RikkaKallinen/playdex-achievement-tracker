import { useState } from "react";
import { trophyTiers } from "./data";
import { formatDate } from "./formatDate";
import { findTargetInDescription } from "./progressMatch";

function AchievementCard({ achievement, onToggle, onDelete, onUpdate, onLoadStats }) {
    const [statOptions, setStatOptions] = useState(null);

    const isSynced = achievement.source === "steam";
    const canTrackProgress = onLoadStats && achievement.source === "steam" && !achievement.earned;
    const showProgress = !achievement.earned && achievement.progressStat && achievement.progressTarget > 0;
    const progressPercent = showProgress
        ? Math.min(100, Math.round((achievement.progressValue / achievement.progressTarget) * 100))
        : 0;

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

    async function handleEditToggle(event) {
        if (event.currentTarget.open && canTrackProgress && statOptions === null) {
            setStatOptions(await onLoadStats());
        }
    }

    function handleStatChange(event) {
        const statName = event.target.value;
        if (!statName) {
            onUpdate({ progressStat: null, progressTarget: null, progressValue: null, progressPicked: true });
            return;
        }

        const stat = statOptions.find((option) => option.name === statName);
        onUpdate({
            progressStat: statName,
            progressTarget: achievement.progressTarget || findTargetInDescription(achievement.description),
            progressValue: stat.value,
            progressPicked: true
        });
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
                    <details className="achievement-edit" onToggle={handleEditToggle}>
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
                        {canTrackProgress && (
                            <>
                                {statOptions === null && <p>Loading Steam counters...</p>}
                                {statOptions && statOptions.length === 0 && <p>This game has no Steam counters.</p>}
                                {statOptions && statOptions.length > 0 && (
                                    <>
                                        <label htmlFor={"stat-" + achievement.name}>Steam counter</label>
                                        <select
                                            id={"stat-" + achievement.name}
                                            value={achievement.progressStat || ""}
                                            onChange={handleStatChange}
                                        >
                                            <option value="">Not tracked</option>
                                            {statOptions.map((stat) => (
                                                <option key={stat.name} value={stat.name}>
                                                    {stat.displayName} ({stat.value})
                                                </option>
                                            ))}
                                        </select>
                                        {achievement.progressStat && (
                                            <>
                                                <label htmlFor={"target-" + achievement.name}>Target</label>
                                                <input
                                                    type="number"
                                                    id={"target-" + achievement.name}
                                                    min="1"
                                                    value={achievement.progressTarget || ""}
                                                    onChange={(event) => onUpdate({ progressTarget: Number(event.target.value), progressPicked: true })}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </details>
                </div>
            </div>
        </article>
    );
}

export default AchievementCard;
