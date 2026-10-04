function AchievementCard({ achievement }) {
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
            <label>
                <input type="checkbox" checked={achievement.earned} readOnly />
                {" "}Unlocked
            </label>
            {achievement.earned && (
                <p>
                    Unlocked on <time dateTime={achievement.earnedDate}>{formattedDate}</time>
                </p>
            )}
        </article>
    );
}

export default AchievementCard;
