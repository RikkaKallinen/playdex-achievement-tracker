import { useState } from "react";

const bucketNames = {
    week: "day",
    month: "day",
    year: "month",
    all: "year"
};

function getBreakdown(bucket) {
    const perGame = {};
    for (const unlock of bucket.unlocks) {
        perGame[unlock.game.title] = (perGame[unlock.game.title] || 0) + 1;
    }

    return Object.entries(perGame)
        .map(([title, count]) => ({ title: title, count: count }))
        .sort((a, b) => b.count - a.count);
}

function ActivityChart({ buckets, period }) {
    const [activeKey, setActiveKey] = useState(null);

    const mostInOne = Math.max(0, ...buckets.map((bucket) => bucket.count));
    const highest = Math.max(1, mostInOne);
    const showEveryLabel = buckets.length <= 12;

    function getTooltipSide(index) {
        if (index < 2) {
            return "left";
        }

        if (index > buckets.length - 3) {
            return "right";
        }

        return "center";
    }

    return (
        <div className="activity-chart">
            <div className="activity-header">
                <h3 className="label">Achievements unlocked per {bucketNames[period]}</h3>
                <span className="stat-detail">Most in one {bucketNames[period]}: {mostInOne}</span>
            </div>

            <div className="activity-bars">
                {buckets.map((bucket, index) => {
                    const isActive = bucket.key === activeKey && bucket.count > 0;
                    const breakdown = isActive ? getBreakdown(bucket) : [];

                    return (
                        <div
                            key={bucket.key}
                            className={isActive ? "activity-column active" : "activity-column"}
                            tabIndex={bucket.count > 0 ? 0 : -1}
                            aria-label={bucket.label + ": " + bucket.count + " unlocked"}
                            onMouseEnter={() => setActiveKey(bucket.key)}
                            onMouseLeave={() => setActiveKey(null)}
                            onFocus={() => setActiveKey(bucket.key)}
                            onBlur={() => setActiveKey(null)}
                        >
                            <div className="activity-bar-area">
                                {bucket.count > 0 && (
                                    <div className="activity-bar" style={{ height: (bucket.count / highest) * 100 + "%" }} />
                                )}
                            </div>
                            <span className="activity-label">
                                {showEveryLabel || index % 5 === 0 ? bucket.label : ""}
                            </span>

                            {isActive && (
                                <div className={"activity-tooltip " + getTooltipSide(index)} role="tooltip">
                                    <p className="activity-tooltip-title">
                                        {bucket.label}
                                        <span>{bucket.count} unlocked</span>
                                    </p>
                                    <ul>
                                        {breakdown.slice(0, 8).map((game) => (
                                            <li key={game.title}>
                                                <span className="activity-tooltip-game">{game.title}</span>
                                                <span className="activity-tooltip-count">{game.count}</span>
                                                <span className="activity-tooltip-bar" style={{ width: (game.count / bucket.count) * 100 + "%" }} />
                                            </li>
                                        ))}
                                    </ul>
                                    {breakdown.length > 8 && (
                                        <p className="activity-tooltip-more">…and {breakdown.length - 8} more games</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="stat-detail activity-hint">Hover a bar to see which games.</p>
        </div>
    );
}

export default ActivityChart;
