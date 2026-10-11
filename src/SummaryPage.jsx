import { platformNames } from "./data";

function countAchievements(games) {
    const achievements = games.flatMap((game) => game.achievements);

    return {
        unlocked: achievements.filter((achievement) => achievement.earned).length,
        total: achievements.length
    };
}

function SummaryPage({ games }) {
    const overall = countAchievements(games);

    const platformSections = Object.keys(platformNames)
        .map((platform) => ({
            platform: platform,
            name: platformNames[platform],
            games: games.filter((game) => game.platform === platform)
        }))
        .filter((section) => section.games.length > 0);

    return (
        <>
            <section>
                <h2>Summary</h2>
                <p>{overall.unlocked} of {overall.total} achievements unlocked</p>
                {overall.total > 0 && <progress value={overall.unlocked} max={overall.total} />}
            </section>

            {platformSections.map((section) => {
                const counts = countAchievements(section.games);

                return (
                    <section key={section.platform}>
                        <h2>{section.name}</h2>
                        <p>
                            {section.games.length} {section.games.length === 1 ? "game" : "games"}
                            {" · "}
                            {counts.unlocked} of {counts.total} achievements unlocked
                        </p>
                    </section>
                );
            })}
        </>
    );
}

export default SummaryPage;
