function GoalCard({ goal, games }) {
    const game = games.find((game) => game.id === goal.gameId);

    return (
        <article className="goal-card">
            <h3>{goal.text}</h3>
            {game && <p>{game.title}</p>}
        </article>
    );
}

export default GoalCard;
