import { platformNames } from "./data";
import { countAchievements, countGamerscore, countTrophies } from "./stats";

function SummaryPage({ games, hiddenPlatforms }) {
    const overall = countAchievements(games);

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
                <p>{overall.unlocked} of {overall.total} achievements unlocked</p>
                {overall.total > 0 && <progress value={overall.unlocked} max={overall.total} />}
            </section>

            {platformSections.map((section) => {
                const counts = countAchievements(section.games);
                const gamerscore = countGamerscore(section.games);
                const trophies = countTrophies(section.games);

                return (
                    <section key={section.platform}>
                        <h2>{section.name}</h2>
                        <p>
                            {section.games.length} {section.games.length === 1 ? "game" : "games"}
                            {" · "}
                            {counts.unlocked} of {counts.total} achievements unlocked
                        </p>
                        {section.platform === "xbox" && (
                            <p>Gamerscore: {gamerscore.earned} of {gamerscore.total}</p>
                        )}
                        {section.platform === "playstation" && (
                            <p>Trophies: {trophies.map((trophy) => trophy.name + " " + trophy.count).join(" · ")}</p>
                        )}
                    </section>
                );
            })}
        </>
    );
}

export default SummaryPage;
