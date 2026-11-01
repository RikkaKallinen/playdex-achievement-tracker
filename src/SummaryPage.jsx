import { useState } from "react";
import { Link } from "react-router";
import { platformNames } from "./data";
import { countAchievements, countGamerscore, countTrophies } from "./stats";
import { getGoalStatus } from "./goalStatus";
import { formatDate } from "./formatDate";
import { periods, getPeriodStart, getUnlocks, getLongestStreak, getActivityBuckets } from "./summaryStats";
import ProgressRing from "./ProgressRing";
import ActivityChart from "./ActivityChart";
import GenreChart from "./GenreChart";

function getPercent(counts) {
    return counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;
}

function SummaryPage({ games, goals, sessions, hiddenPlatforms }) {
    const [period, setPeriod] = useState("all");
    const periodStart = getPeriodStart(period);

    const overall = countAchievements(games);
    const allUnlocks = getUnlocks(games);
    const periodUnlocks = allUnlocks.filter((unlock) => unlock.date >= periodStart);

    const gamesPlayed = games.filter((game) => {
        if (period === "all") {
            return game.playtimeMinutes > 0 || game.achievements.some((achievement) => achievement.earned);
        }

        return (game.lastPlayed && game.lastPlayed >= periodStart)
            || periodUnlocks.some((unlock) => unlock.game.id === game.id);
    });

    const goalsCompleted = goals.filter((goal) => {
        const status = getGoalStatus(goal, games);
        return status.completed && (status.completedDate || "") >= periodStart;
    });

    const sessionsPlayed = sessions.filter((session) => (session.endedDate || session.startedDate) >= periodStart);

    const tiles = [
        {
            label: "Achievements unlocked",
            value: periodUnlocks.length.toLocaleString(),
            detail: period === "all" ? "of " + overall.total.toLocaleString() + " · " + getPercent(overall) + "%" : null
        },
        {
            label: "Games played",
            value: gamesPlayed.length.toLocaleString(),
            detail: period === "all" ? "of " + games.length.toLocaleString() + " in your library" : null
        },
        { label: "Goals completed", value: goalsCompleted.length.toLocaleString() },
        { label: "Sessions", value: sessionsPlayed.length.toLocaleString() }
    ];

    const mostPlayed = games
        .filter((game) => game.playtimeMinutes > 0)
        .sort((a, b) => b.playtimeMinutes - a.playtimeMinutes)
        .slice(0, 5);
    const topMinutes = mostPlayed.length > 0 ? mostPlayed[0].playtimeMinutes : 1;

    const closestToDone = games
        .map((game) => ({ game: game, counts: countAchievements([game]) }))
        .filter(({ counts }) => counts.total >= 5 && counts.unlocked < counts.total && counts.unlocked > 0)
        .sort((a, b) => getPercent(b.counts) - getPercent(a.counts))
        .slice(0, 5);

    const perfectGames = games.filter((game) => {
        const counts = countAchievements([game]);
        return counts.total > 0 && counts.unlocked === counts.total;
    });

    const longestStreak = getLongestStreak(allUnlocks);

    const platformSections = Object.keys(platformNames)
        .map((platform) => ({
            platform: platform,
            name: platformNames[platform],
            games: games.filter((game) => game.platform === platform)
        }))
        .filter((section) => section.games.length > 0 && !hiddenPlatforms.includes(section.platform));

    return (
        <>
            <section>
                <h2>Summary</h2>

                <div className="filter-chips">
                    {periods.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={option.value === period ? "chip selected" : "chip"}
                            onClick={() => setPeriod(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="stat-tiles">
                    {tiles.map((tile) => (
                        <div key={tile.label} className="stat-tile">
                            <p className="label">{tile.label}</p>
                            <p className="stat-tile-value">{tile.value}</p>
                            {tile.detail && <p className="stat-detail">{tile.detail}</p>}
                        </div>
                    ))}
                </div>

                <div className="summary-card">
                    <ActivityChart buckets={getActivityBuckets(allUnlocks, period)} period={period} />
                </div>

                <div className="summary-card">
                    <h3 className="label">Recent unlocks</h3>
                    {periodUnlocks.length === 0 ? (
                        <p className="stat-detail">Nothing unlocked {period === "all" ? "yet" : periods.find((option) => option.value === period).label.toLowerCase()}. Go get some!</p>
                    ) : (
                        <ul className="recent-unlocks">
                            {periodUnlocks.slice(0, 8).map(({ game, achievement, date }) => (
                                <li key={game.id + achievement.name}>
                                    <Link to={"/games/" + game.id} className="recent-unlock">
                                        <span className="achievement-icon recent-unlock-icon" aria-hidden="true">
                                            {achievement.iconUrl ? <img src={achievement.iconUrl} alt="" /> : "🏆"}
                                        </span>
                                        <span className="recent-unlock-text">
                                            <span className="recent-unlock-name">{achievement.name}</span>
                                            <span className="stat-detail">{game.title} · {formatDate(date)}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="summary-section">
                <h3 className="label">Highlights · all time</h3>
                <div className="highlight-grid">
                    <div className="summary-card">
                        <h3 className="label">Most played</h3>
                        {mostPlayed.length === 0 && <p className="stat-detail">Sync with Steam to see your hours.</p>}
                        <ol className="ranked-list">
                            {mostPlayed.map((game) => (
                                <li key={game.id}>
                                    <Link to={"/games/" + game.id} className="ranked-row">
                                        <span className="ranked-title">{game.title}</span>
                                        <span className="ranked-value">{Math.round(game.playtimeMinutes / 60).toLocaleString()} hrs</span>
                                        <span className="stat-bar ranked-bar">
                                            <span className="stat-bar-fill" style={{ width: (game.playtimeMinutes / topMinutes) * 100 + "%" }} />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="summary-card">
                        <h3 className="label">Closest to 100%</h3>
                        {closestToDone.length === 0 && <p className="stat-detail">No games in progress yet.</p>}
                        <ol className="ranked-list">
                            {closestToDone.map(({ game, counts }) => (
                                <li key={game.id}>
                                    <Link to={"/games/" + game.id} className="ranked-row">
                                        <span className="ranked-title">{game.title}</span>
                                        <span className="ranked-value">{getPercent(counts)}%</span>
                                        <span className="stat-bar ranked-bar">
                                            <span className="stat-bar-fill" style={{ width: getPercent(counts) + "%" }} />
                                        </span>
                                        <span className="stat-detail ranked-note">
                                            {(counts.total - counts.unlocked).toLocaleString()} to go
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="summary-card">
                        <GenreChart games={games} />
                    </div>

                    <div className="highlight-tiles">
                        <div className="stat-tile">
                            <p className="label">Perfect games</p>
                            <p className="stat-tile-value">{perfectGames.length}</p>
                            <p className="stat-detail">
                                {perfectGames.length > 0
                                    ? perfectGames.slice(0, 3).map((game) => game.title).join(", ") + (perfectGames.length > 3 ? "…" : "")
                                    : "Every achievement in a game unlocked"}
                            </p>
                        </div>
                        <div className="stat-tile">
                            <p className="label">Longest unlock streak</p>
                            <p className="stat-tile-value">{longestStreak}</p>
                            <p className="stat-detail">{longestStreak === 1 ? "day" : "days in a row"}</p>
                        </div>
                    </div>
                </div>
            </section>

            {platformSections.length > 0 && (
                <section className="summary-section">
                    <h3 className="label">By platform</h3>
                    <div className="platform-cards">
                        {platformSections.map((section) => {
                            const counts = countAchievements(section.games);
                            const gamerscore = countGamerscore(section.games);
                            const trophies = countTrophies(section.games);
                            const hoursPlayed = Math.round(
                                section.games.reduce((sum, game) => sum + (game.playtimeMinutes || 0), 0) / 60
                            );

                            return (
                                <article key={section.platform} className="platform-card">
                                    <div className="platform-card-header">
                                        <div>
                                            <p className="badge">{section.name}</p>
                                            <p className="platform-card-games">
                                                {section.games.length.toLocaleString()} {section.games.length === 1 ? "game" : "games"}
                                            </p>
                                        </div>
                                        <ProgressRing percent={getPercent(counts)} />
                                    </div>

                                    <p className="platform-card-stat">
                                        {counts.unlocked.toLocaleString()}
                                        <span className="unit"> / {counts.total.toLocaleString()} achievements</span>
                                    </p>

                                    {section.platform === "steam" && hoursPlayed > 0 && (
                                        <p className="stat-detail">{hoursPlayed.toLocaleString()} hours played</p>
                                    )}
                                    {section.platform === "xbox" && (
                                        <p className="stat-detail">
                                            {gamerscore.earned.toLocaleString()} / {gamerscore.total.toLocaleString()} Gamerscore
                                        </p>
                                    )}
                                    {section.platform === "playstation" && (
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
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}
        </>
    );
}

export default SummaryPage;
