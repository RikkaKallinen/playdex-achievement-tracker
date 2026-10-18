import { useState } from "react";
import AddGoalForm from "./AddGoalForm";
import GoalCard from "./GoalCard";
import { getGoalStatus } from "./goalStatus";

function GoalsPage({ goals, games, onAddGoal, onToggleGoal, onDeleteGoal, onUpdateGoalProgress }) {
    const [isAdding, setIsAdding] = useState(false);
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
            {isAdding ? (
                <div className="add-panel">
                    <AddGoalForm
                        games={games.filter((game) => !game.deleted)}
                        onAddGoal={(newGoal) => {
                            onAddGoal(newGoal);
                            setIsAdding(false);
                        }}
                        onCancel={() => setIsAdding(false)}
                    />
                </div>
            ) : (
                <div className="game-header-actions">
                    <button type="button" onClick={() => setIsAdding(true)}>+ Add goal</button>
                </div>
            )}

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
