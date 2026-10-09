import { useState } from "react";
import GoalCard from "./GoalCard";
import { getGoalStatus } from "./goalStatus";

function SessionPage({ goals, games, activeSession, lastKeptGoalIds, onStartSession, onEndSession, onToggleGoal, onDeleteGoal, onUpdateGoalProgress }) {
    const [pickedGoalIds, setPickedGoalIds] = useState(lastKeptGoalIds);
    const [isEnding, setIsEnding] = useState(false);
    const [droppedGoalIds, setDroppedGoalIds] = useState([]);
    const [summaries, setSummaries] = useState({});

    const unfinishedGoals = goals.filter((goal) => !getGoalStatus(goal, games).completed);
    const sessionGoals = activeSession
        ? goals.filter((goal) => activeSession.goalIds.includes(goal.id))
        : [];
    const unfinishedSessionGoals = sessionGoals.filter((goal) => !getGoalStatus(goal, games).completed);
    const progressSessionGoals = sessionGoals.filter((goal) => goal.target);
    const sessionGames = games.filter((game) => sessionGoals.some((goal) => goal.gameId === game.id));

    function togglePicked(goalId) {
        if (pickedGoalIds.includes(goalId)) {
            setPickedGoalIds(pickedGoalIds.filter((id) => id !== goalId));
        } else {
            setPickedGoalIds([...pickedGoalIds, goalId]);
        }
    }

    function toggleDropped(goalId) {
        if (droppedGoalIds.includes(goalId)) {
            setDroppedGoalIds(droppedGoalIds.filter((id) => id !== goalId));
        } else {
            setDroppedGoalIds([...droppedGoalIds, goalId]);
        }
    }

    function handleStart() {
        const startingGoalIds = pickedGoalIds.filter((id) => unfinishedGoals.some((goal) => goal.id === id));
        onStartSession(startingGoalIds);
        setPickedGoalIds([]);
    }

    function handleFinish() {
        const keptGoalIds = unfinishedSessionGoals
            .map((goal) => goal.id)
            .filter((id) => !droppedGoalIds.includes(id));

        const summaryList = sessionGames
            .filter((game) => summaries[game.id] && summaries[game.id].trim() !== "")
            .map((game) => ({ gameId: game.id, text: summaries[game.id].trim() }));

        onEndSession(keptGoalIds, summaryList);
        setIsEnding(false);
        setDroppedGoalIds([]);
        setSummaries({});
        setPickedGoalIds(keptGoalIds);
    }

    if (!activeSession) {
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

    if (isEnding) {
        return (
            <section>
                <h2>Wrap up the session</h2>

                {progressSessionGoals.length > 0 && (
                    <>
                        <h3>Update progress?</h3>
                        {progressSessionGoals.map((goal) => (
                            <p key={goal.id}>
                                <label>
                                    {goal.text}{" "}
                                    <input
                                        type="number"
                                        min="0"
                                        max={goal.target}
                                        value={goal.progress}
                                        onChange={(event) => onUpdateGoalProgress(goal.id, Number(event.target.value))}
                                    />
                                    {" "}/ {goal.target}
                                </label>
                            </p>
                        ))}
                    </>
                )}

                {unfinishedSessionGoals.length > 0 && (
                    <>
                        <h3>Unfinished goals</h3>
                        <p>Untick any goal you want to drop from your next session. It stays on the Goals page.</p>
                        {unfinishedSessionGoals.map((goal) => (
                            <p key={goal.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!droppedGoalIds.includes(goal.id)}
                                        onChange={() => toggleDropped(goal.id)}
                                    />
                                    {" "}Keep "{goal.text}" for next session
                                </label>
                            </p>
                        ))}
                    </>
                )}

                {sessionGames.length > 0 && (
                    <>
                        <h3>Session summaries (optional)</h3>
                        {sessionGames.map((game) => (
                            <p key={game.id}>
                                <label htmlFor={"summary-" + game.id}>{game.title}</label>
                                <textarea
                                    id={"summary-" + game.id}
                                    rows="3"
                                    value={summaries[game.id] || ""}
                                    onChange={(event) => setSummaries({ ...summaries, [game.id]: event.target.value })}
                                />
                            </p>
                        ))}
                    </>
                )}

                <button onClick={handleFinish}>Finish session</button>
                {" "}
                <button onClick={() => setIsEnding(false)}>Back</button>
            </section>
        );
    }

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
            <button onClick={() => setIsEnding(true)}>End session</button>
        </section>
    );
}

export default SessionPage;
