import { useState } from "react";
import { Gamepad2, Play, Target, Zap } from "lucide-react";
import GoalCard from "./GoalCard";
import AddGoalForm from "./AddGoalForm";
import GamePicker from "./GamePicker";
import SessionTimer from "./SessionTimer";
import { getGoalStatus, groupGoalsByGame } from "./goalStatus";
import { formatDate } from "./formatDate";

function SessionPage({
    goals,
    games,
    activeSession,
    lastKeptGoalIds,
    onStartSession,
    onEndSession,
    onAddGoalToSession,
    onAddGameToSession,
    onRemoveGameFromSession,
    onAddNewGoal,
    onToggleGoal,
    onDeleteGoal,
    onUpdateGoalProgress
}) {
    const [pickedGoalIds, setPickedGoalIds] = useState(lastKeptGoalIds);
    const [pickedGameIds, setPickedGameIds] = useState([]);
    const [isEnding, setIsEnding] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [droppedGoalIds, setDroppedGoalIds] = useState([]);
    const [summaries, setSummaries] = useState({});
    const [justStarted, setJustStarted] = useState(false);

    const activeGames = games.filter((game) => !game.deleted);
    const unfinishedGoals = goals.filter((goal) => !getGoalStatus(goal, games).completed);

    const sessionGoals = activeSession
        ? goals.filter((goal) => activeSession.goalIds.includes(goal.id))
        : [];
    const sessionGoalsDone = sessionGoals.filter((goal) => getGoalStatus(goal, games).completed).length;
    const unfinishedSessionGoals = sessionGoals.filter((goal) => !getGoalStatus(goal, games).completed);
    const progressSessionGoals = sessionGoals.filter((goal) => goal.target);
    const goalsToAdd = unfinishedGoals.filter((goal) => !sessionGoals.includes(goal));

    const goalGameIds = sessionGoals.map((goal) => goal.gameId).filter((gameId) => gameId);
    const sessionGameIds = activeSession ? [...new Set([...(activeSession.gameIds || []), ...goalGameIds])] : [];
    const sessionGames = games.filter((game) => sessionGameIds.includes(game.id));

    function toggleIn(list, setList, id) {
        if (list.includes(id)) {
            setList(list.filter((existingId) => existingId !== id));
        } else {
            setList([...list, id]);
        }
    }

    function handleStart() {
        const startingGoalIds = pickedGoalIds.filter((id) => unfinishedGoals.some((goal) => goal.id === id));
        onStartSession(startingGoalIds, pickedGameIds);
        setJustStarted(true);
        setPickedGoalIds([]);
        setPickedGameIds([]);
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

    function renderGoalGroups(goalList) {
        return groupGoalsByGame(goalList, games).map((group) => (
            <div key={group.key} className="goal-group">
                <h4 className="goal-group-title">
                    {group.title}
                    <span className="goal-group-count">{group.goals.length}</span>
                </h4>
                {group.goals.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        games={games}
                        showGame={false}
                        onToggle={() => onToggleGoal(goal.id)}
                        onDelete={() => onDeleteGoal(goal.id)}
                        onProgressChange={(newProgress) => onUpdateGoalProgress(goal.id, newProgress)}
                    />
                ))}
            </div>
        ));
    }

    if (!activeSession) {
        const goalGroups = groupGoalsByGame(unfinishedGoals, games);

        return (
            <section>
                <h2>Session</h2>

                <div className="session-start">
                    <div className="session-start-intro">
                        <span className="journal-icon session-start-icon" aria-hidden="true"><Zap size={20} /></span>
                        <div>
                            <h3 className="session-start-title">Ready to play?</h3>
                            <p className="stat-detail">Add what you're playing and any goals to chase. Both are optional.</p>
                        </div>
                    </div>

                    <div className="session-start-row">
                        <p className="session-start-label"><Gamepad2 size={16} aria-hidden="true" /> Games</p>
                        <GamePicker
                            games={activeGames}
                            pickedIds={pickedGameIds}
                            onAdd={(gameId) => setPickedGameIds([...pickedGameIds, gameId])}
                            onRemove={(gameId) => setPickedGameIds(pickedGameIds.filter((id) => id !== gameId))}
                        />
                    </div>

                    <div className="session-start-row">
                        <p className="session-start-label"><Target size={16} aria-hidden="true" /> Goals</p>
                        <div>
                            {goalGroups.length === 0 && (
                                <p className="stat-detail">No goals waiting. You can write one once you start.</p>
                            )}
                            {goalGroups.map((group) => (
                                <div key={group.key} className="goal-pick-group">
                                    <p className="goal-pick-game">{group.title}</p>
                                    <div className="goal-pick-list">
                                        {group.goals.map((goal) => (
                                            <label
                                                key={goal.id}
                                                className={pickedGoalIds.includes(goal.id) ? "goal-pick picked" : "goal-pick"}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={pickedGoalIds.includes(goal.id)}
                                                    onChange={() => toggleIn(pickedGoalIds, setPickedGoalIds, goal.id)}
                                                />
                                                <span>{goal.text}</span>
                                                {goal.target && (
                                                    <span className="stat-detail">{goal.progress} / {goal.target}</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="button" className="session-start-button" onClick={handleStart}>
                        <Play size={18} aria-hidden="true" />
                        Start session
                    </button>
                </div>
            </section>
        );
    }

    if (isEnding) {
        return (
            <section className="session-wrapup">
                <h2>Wrap up the session</h2>

                {progressSessionGoals.length > 0 && (
                    <div className="session-panel">
                        <h3 className="label">Update progress?</h3>
                        {progressSessionGoals.map((goal) => (
                            <label key={goal.id} className="wrap-row">
                                <span>{goal.text}</span>
                                <span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={goal.target}
                                        value={goal.progress}
                                        onChange={(event) => onUpdateGoalProgress(goal.id, Number(event.target.value))}
                                    />
                                    {" "}/ {goal.target}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {unfinishedSessionGoals.length > 0 && (
                    <div className="session-panel">
                        <h3 className="label">Unfinished goals</h3>
                        <p className="stat-detail session-panel-note">Untick any you don't want in your next session. They stay on the Goals page either way.</p>
                        {unfinishedSessionGoals.map((goal) => (
                            <label key={goal.id} className="wrap-row">
                                <span>
                                    <input
                                        type="checkbox"
                                        checked={!droppedGoalIds.includes(goal.id)}
                                        onChange={() => toggleIn(droppedGoalIds, setDroppedGoalIds, goal.id)}
                                    />
                                    {" "}Keep "{goal.text}" for next session
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {sessionGames.length > 0 && (
                    <div className="session-panel">
                        <h3 className="label">Session summaries (optional)</h3>
                        <p className="stat-detail session-panel-note">A few words about tonight. They show up on each game's timeline.</p>
                        {sessionGames.map((game) => (
                            <div key={game.id} className="summary-box">
                                <label htmlFor={"summary-" + game.id}>{game.title}</label>
                                <textarea
                                    id={"summary-" + game.id}
                                    rows="3"
                                    value={summaries[game.id] || ""}
                                    onChange={(event) => setSummaries({ ...summaries, [game.id]: event.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="button-row">
                    <button type="button" onClick={handleFinish}>Finish session</button>
                    <button type="button" className="button-quiet" onClick={() => setIsEnding(false)}>Back</button>
                </div>
            </section>
        );
    }

    return (
        <section>
            <h2>Tonight's session</h2>

            <div className={justStarted ? "session-live-header just-started" : "session-live-header"}>
                <div>
                    <p className="label">Session in progress</p>
                    <p className="session-live-date">{formatDate(activeSession.startedDate)}</p>
                </div>
                {activeSession.startedAt && <SessionTimer startedAt={activeSession.startedAt} />}
                <div className="session-live-progress">
                    <span className="stat-tile-value">{sessionGoalsDone}</span>
                    <span className="stat-detail">of {sessionGoals.length} goals done</span>
                </div>
            </div>

            <div className="session-panel">
                <h3 className="label">Playing</h3>
                <GamePicker
                    games={activeGames}
                    pickedIds={sessionGameIds}
                    lockedIds={goalGameIds}
                    onAdd={onAddGameToSession}
                    onRemove={onRemoveGameFromSession}
                />
            </div>

            <div className="session-panel">
                <div className="session-goals-header">
                    <h3 className="label">Goals</h3>
                    {goalsToAdd.length > 0 && (
                        <select
                            aria-label="Add an existing goal"
                            value=""
                            onChange={(event) => onAddGoalToSession(event.target.value)}
                        >
                            <option value="">+ Add an existing goal</option>
                            {goalsToAdd.map((goal) => {
                                const { game } = getGoalStatus(goal, games);
                                return (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.text}{game ? " · " + game.title : ""}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    {!isAddingGoal && (
                        <button type="button" className="button-quiet" onClick={() => setIsAddingGoal(true)}>
                            + New goal
                        </button>
                    )}
                </div>

                {isAddingGoal && (
                    <div className="add-panel">
                        <AddGoalForm
                            games={activeGames}
                            onAddGoal={(newGoal) => {
                                onAddNewGoal(newGoal);
                                setIsAddingGoal(false);
                            }}
                            onCancel={() => setIsAddingGoal(false)}
                        />
                    </div>
                )}

                {sessionGoals.length === 0 && !isAddingGoal && (
                    <p className="stat-detail">No goals tonight. Just playing is fine too.</p>
                )}
                {renderGoalGroups(sessionGoals)}
            </div>

            <div className="button-row">
                <button type="button" onClick={() => setIsEnding(true)}>End session</button>
            </div>
        </section>
    );
}

export default SessionPage;
