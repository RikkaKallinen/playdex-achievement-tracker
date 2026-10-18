import AddGoalForm from "./AddGoalForm";
import GoalCard from "./GoalCard";
import { getGoalStatus } from "./goalStatus";

function GoalsPage({ goals, games, onAddGoal, onToggleGoal, onDeleteGoal, onUpdateGoalProgress }) {
    const inProgressGoals = goals.filter((goal) => !getGoalStatus(goal, games).completed);
    const completedGoals = goals.filter((goal) => getGoalStatus(goal, games).completed);

    function renderGoalCard(goal) {
        return (
            <GoalCard
                key={goal.id}
                goal={goal}
                games={games}
                onToggle={() => onToggleGoal(goal.id)}
                onDelete={() => onDeleteGoal(goal.id)}
                onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
            />
        );
    }

    return (
        <section>
            <h2>Goals</h2>
            <div className="game-header-actions">
                <details className="add-panel">
                    <summary>+ Add goal</summary>
                    <AddGoalForm games={games.filter((game) => !game.deleted)} onAddGoal={onAddGoal} />
                </details>
            </div>

            {goals.length === 0 && <p>No goals yet</p>}

            {inProgressGoals.length > 0 && (
                <>
                    <h3 className="label">In progress ({inProgressGoals.length})</h3>
                    {inProgressGoals.map(renderGoalCard)}
                </>
            )}

            {completedGoals.length > 0 && (
                <>
                    <h3 className="label">Completed ({completedGoals.length})</h3>
                    {completedGoals.map(renderGoalCard)}
                </>
            )}
        </section>
    );
}

export default GoalsPage;
