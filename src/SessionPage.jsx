import { useState } from "react";
import GoalCard from "./GoalCard";
import { getGoalStatus } from "./goalStatus";

function SessionPage({ goals, games, activeSession, onStartSession, onEndSession, onToggleGoal, onDeleteGoal, onUpdateGoalProgress }) {
    const [pickedGoalIds, setPickedGoalIds] = useState([]);

    function togglePicked(goalId) {
        if (pickedGoalIds.includes(goalId)) {
            setPickedGoalIds(pickedGoalIds.filter((id) => id !== goalId));
        } else {
            setPickedGoalIds([...pickedGoalIds, goalId]);
        }
    }

    function handleStart() {
        onStartSession(pickedGoalIds);
        setPickedGoalIds([]);
    }

    if (!activeSession) {
        const unfinishedGoals = goals.filter((goal) => !getGoalStatus(goal, games).completed);

        return (
            <section>
                <h2>Start a Session</h2>
                <p>Pick tonight's goals:</p>
                {unfinishedGoals.length === 0 && <p>No unfinished goals. Add some on the Goals page.</p>}
                {unfinishedGoals.map((goal) => {
                    const { game } = getGoalStatus(goal, games);

                    return (
                        <p key={goal.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={pickedGoalIds.includes(goal.id)}
                                    onChange={() => togglePicked(goal.id)}
                                />
                                {" "}{goal.text}{game && " (" + game.title + ")"}
                            </label>
                        </p>
                    );
                })}
                <button onClick={handleStart} disabled={pickedGoalIds.length === 0}>
                    Start Session
                </button>
            </section>
        );
    }

    const sessionGoals = goals.filter((goal) => activeSession.goalIds.includes(goal.id));

    return (
        <section>
            <h2>Tonight's session</h2>
            {sessionGoals.map((goal) => (
                <GoalCard
                    key={goal.id}
                    goal={goal}
                    games={games}
                    onToggle={() => onToggleGoal(goal.id)}
                    onDelete={() => onDeleteGoal(goal.id)}
                    onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
                />
            ))}
            <button onClick={onEndSession}>End session</button>
        </section>
    );
}

export default SessionPage;
