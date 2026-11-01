import { platformNames } from "./data";
import { countAchievements, countGamerscore, countTrophies } from "./stats";
import { getGoalStatus } from "./goalStatus";
import ProgressRing from "./ProgressRing";

function getPercent(counts) {
    return counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;
}

function SummaryPage({ games, goals, hiddenPlatforms }) {
    const overall = countAchievements(games);
    const goalsCompleted = goals.filter((goal) => getGoalStatus(goal, games).completed).length;

    const tiles = [
        { label: "Games", value: games.length.toLocaleString() },
        { label: "Achievements unlocked", value: overall.unlocked.toLocaleString(), detail: "of " + overall.total.toLocaleString() },
        { label: "Overall completion", value: getPercent(overall) + "%" },
        { label: "Goals completed", value: goalsCompleted.toLocaleString(), detail: "of " + goals.length }
    ];

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
                <div className="stat-tiles">
                    {tiles.map((tile) => (
                        <div key={tile.label} className="stat-tile">
                            <p className="label">{tile.label}</p>
                            <p className="stat-tile-value">{tile.value}</p>
                            {tile.detail && <p className="stat-detail">{tile.detail}</p>}
                        </div>
                    ))}
                </div>
            </section>

            {platformSections.length > 0 && (
                <section>
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
