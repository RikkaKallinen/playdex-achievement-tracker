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
                showGame={false}
                onToggle={() => onToggleGoal(goal.id)}
                onDelete={() => onDeleteGoal(goal.id)}
                onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
            />
        );
    }

    function groupByGame(goalList) {
        const groups = [];

        for (const goal of goalList) {
            const key = goal.gameId || "none";
            let group = groups.find((existingGroup) => existingGroup.key === key);

            if (!group) {
                const game = games.find((game) => game.id === goal.gameId);
                group = { key: key, title: game ? game.title : "No game", goals: [] };
                groups.push(group);
            }

            group.goals.push(goal);
        }

        return groups.sort((a, b) => {
            if (a.key === "none") {
                return 1;
            }

            if (b.key === "none") {
                return -1;
            }

            return a.title.localeCompare(b.title);
        });
    }

    function renderGroups(goalList) {
        return groupByGame(goalList).map((group) => (
            <div key={group.key} className="goal-group">
                <h4 className="goal-group-title">
                    {group.title}
                    <span className="goal-group-count">{group.goals.length}</span>
                </h4>
                {group.goals.map(renderGoalCard)}
            </div>
        ));
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
                    {renderGroups(inProgressGoals)}
                </>
            )}

            {completedGoals.length > 0 && (
                <>
                    <h3 className="label">Completed ({completedGoals.length})</h3>
                    {renderGroups(completedGoals)}
                </>
            )}
        </section>
    );
}

export default GoalsPage;
