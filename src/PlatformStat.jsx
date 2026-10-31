import { countGamerscore, countTrophies  } from "./stats";

function PlatformStat({game}) {
    if (game.platform === "xbox") {
        const gamerscore = countGamerscore([game]);

        return (
            <p className="title-gamerscore">
                {gamerscore.earned}<span className="unit"> / {gamerscore.total} G</span>
            </p>
        );
    }

    if (game.platform === "playstation") {
        const trophies = countTrophies([game]);

        return (
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
        );
    }

    if (game.platform === "steam" && typeof game.playtimeMinutes === "number") {
        const hours = Math.round(game.playtimeMinutes / 6) / 10;

        return (
            <p className="title-gamerscore">
                {hours}<span className="unit"> hrs played</span>
            </p>
        );
    }

    return null;
}

export default PlatformStat;