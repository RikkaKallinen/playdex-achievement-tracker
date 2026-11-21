import { useState } from "react";
import AddGoalForm from "./AddGoalForm";
import GoalCard from "./GoalCard";
import { getGoalStatus, groupGoalsByGame } from "./goalStatus";
import SlidingHighlight from "./SlidingHighlight";
import { getAllTags, hasTag } from "./goalTags";

function GoalsPage({ goals, games, onAddGoal, onToggleGoal, onDeleteGoal, onUpdateGoalProgress, onUpdateGoal }) {
    const [isAdding, setIsAdding] = useState(false);
    const [shownTab, setShownTab] = useState("inProgress");
    const [shownTag, setShownTag] = useState(null);

    // If the picked tag's last goal is deleted, fall back to showing every goal
    const allTags = getAllTags(goals);
    const activeTag = shownTag && hasTag(allTags, shownTag) ? shownTag : null;
    const taggedGoals = activeTag
        ? goals.filter((goal) => hasTag(goal.tags || [], activeTag))
        : goals;

    const inProgressGoals = taggedGoals.filter((goal) => !getGoalStatus(goal, games).completed);
    const completedGoals = taggedGoals.filter((goal) => getGoalStatus(goal, games).completed);

    const tabs = [
        { value: "inProgress", label: "In progress", count: inProgressGoals.length },
        { value: "completed", label: "Completed", count: completedGoals.length }
    ];
    const shownGoals = shownTab === "completed" ? completedGoals : inProgressGoals;

    function renderGoalCard(goal) {
        return (
            <GoalCard
                key={goal.id}
                goal={goal}
                games={games}
                goals={goals}
                showGame={false}
                onToggle={() => onToggleGoal(goal.id)}
                onDelete={() => onDeleteGoal(goal.id)}
                onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
                onSave={(changes) => onUpdateGoal(goal.id, changes)}
            />
        );
    }

    function renderGroups(goalList) {
        return groupGoalsByGame(goalList, games).map((group) => (
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
                        goals={goals}
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

            {goals.length > 0 && (
                <div className="filter-chips">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            className={tab.value === shownTab ? "chip selected" : "chip"}
                            onClick={() => setShownTab(tab.value)}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                    <SlidingHighlight className="chip-highlight" />
                </div>
            )}

            {allTags.length > 0 && (
                <div className="filter-chips" role="group" aria-label="Filter by tag">
                    <button
                        type="button"
                        className={activeTag === null ? "chip selected" : "chip"}
                        onClick={() => setShownTag(null)}
                    >
                        All tags
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            className={tag === activeTag ? "chip selected" : "chip"}
                            onClick={() => setShownTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                    <SlidingHighlight className="chip-highlight" />
                </div>
            )}

            {goals.length > 0 && shownGoals.length === 0 && <p>Nothing here yet</p>}

            {renderGroups(shownGoals)}
        </section>
    );
}

export default GoalsPage;
