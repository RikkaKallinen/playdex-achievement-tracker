import AddGoalForm from "./AddGoalForm";
import GoalCard from "./GoalCard";

function GoalsPage({ goals, games, onAddGoal, onToggleGoal, onDeleteGoal, onUpdateGoalProgress }) {
    return (
        <>
            <section>
                <h2>Add a goal</h2>
                <AddGoalForm games={games} onAddGoal={onAddGoal} />
            </section>

            <section>
                <h2>Goals</h2>
                {goals.length === 0 && <p>No goals yet</p>}
                {goals.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        games={games}
                        onToggle={() => onToggleGoal(goal.id)}
                        onDelete={() => onDeleteGoal(goal.id)}
                        onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
                    />
                ))}
            </section>
        </>
    );
}

export default GoalsPage;
