function GoalCard({ goal, games, onToggle, onDelete }) {
    const game = games.find((game) => game.id === goal.gameId);

    const cardClass = goal.completed
        ? "goal-card completed"
        : "goal-card";

    const formattedDate = goal.completed
        ? new Date(goal.completedDate + "T00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        })
        : null;

    return (
        <article className={cardClass}>
            <h3>{goal.text}</h3>
            {game && <p>{game.title}</p>}
            <label>
                <input type="checkbox" checked={goal.completed} onChange={onToggle} />
                {" "}Completed
            </label>
            <button onClick={onDelete}>Delete</button>
            {goal.completed && (
                <p>
                    Completed on <time dateTime={goal.completedDate}>{formattedDate}</time>
                </p>
            )}
        </article>
    );
}

export default GoalCard;
