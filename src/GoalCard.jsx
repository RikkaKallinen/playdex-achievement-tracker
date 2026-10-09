function GoalCard({ goal, games, onToggle, onDelete, onProgressChange }) {
    const game = games.find((game) => game.id === goal.gameId);

    const achievement = goal.type === "achievement" && game
        ? game.achievements.find((achievement) => achievement.name === goal.achievementName)
        : null;

    const completed = achievement ? achievement.earned : goal.completed;
    const completedDate = achievement ? achievement.earnedDate : goal.completedDate;

    const cardClass = completed
        ? "goal-card completed"
        : "goal-card";

    const formattedDate = completed
        ? new Date(completedDate + "T00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
        : null;

    return (
        <article className={cardClass}>
            <h3>{goal.text}</h3>
            {game && <p>{game.title}</p>}
            {goal.target ? (
                <>
                    <label>
                        Progress{" "}
                        <input
                            type="number"
                            min="0"
                            max={goal.target}
                            value={goal.progress}
                            onChange={(event) => onProgressChange(Number(event.target.value))}
                        />
                        {" "}/ {goal.target}
                    </label>
                    <progress value={goal.progress} max={goal.target} />
                </>
            ) : (
                <label>
                    <input type="checkbox" checked={completed} onChange={onToggle} />
                    {" "}Completed
                </label>
            )}
            <button onClick={onDelete}>Delete</button>
            {completed && (
                <p>
                    Completed on <time dateTime={completedDate}>{formattedDate}</time>
                </p>
            )}
        </article>
    );
}

export default GoalCard;
