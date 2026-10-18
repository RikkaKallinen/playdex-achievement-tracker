import { useState } from "react";
import { Link, useParams } from "react-router";
import AchievementCard from "./AchievementCard";
import AddAchievementForm from "./AddAchievementForm";
import AddJournalEntryForm from "./AddJournalEntryForm";
import TimelineItem from "./TimelineItem";
import FilterDropdown from "./FilterDropdown";
import { getGoalStatus } from "./goalStatus";
import { getPlatformText } from "./data";
import GameCover from "./GameCover";
import PlatformStat from "./PlatformStat";
import ProgressRing from "./ProgressRing";
import { countAchievements } from "./stats";

const filterOptions = [
    { type: "entry", label: "Journal entries" },
    { type: "achievement", label: "Achievements" },
    { type: "goal", label: "Goals" },
    { type: "summary", label: "Session summaries" }
];

function GamePage({ games, goals, sessions, journalEntries, onAddAchievement, onToggleAchievement, onDeleteAchievement, onUpdateAchievement, onUpdateGameCover, onAddJournalEntry, onDeleteJournalEntry }) {
    const { gameId } = useParams();
    const game = games.find((game) => game.id === gameId);
    const [shownTypes, setShownTypes] = useState(filterOptions.map((option) => option.type));
    const [isAdding, setIsAdding] = useState(false);

    function toggleShownType(type) {
        if (shownTypes.includes(type)) {
            setShownTypes(shownTypes.filter((shownType) => shownType !== type));
        } else {
            setShownTypes([...shownTypes, type]);
        }
    }

    function toggleAllShownTypes() {
        if (shownTypes.length === filterOptions.length) {
            setShownTypes([]);
        } else {
            setShownTypes(filterOptions.map((option) => option.type));
        }
    }

    if (!game) {
        return (
            <section>
                <p>Game not found.</p>
                <Link to="/">Back to games</Link>
            </section>
        );
    }

    const gameGoals = goals.filter((goal) => goal.gameId === game.id);
    const inProgressGoals = gameGoals.filter((goal) => !getGoalStatus(goal, games).completed);
    const completedGoals = gameGoals.filter((goal) => goal.type !== "achievement" && getGoalStatus(goal, games).completed);

    const timelineItems = [
        ...journalEntries
            .filter((entry) => entry.gameId === game.id)
            .map((entry) => ({
                key: "entry-" + entry.id,
                type: "entry",
                id: entry.id,
                date: entry.date,
                title: null,
                text: entry.text
            })),
        ...game.achievements
            .filter((achievement) => achievement.earned)
            .map((achievement) => ({
                key: "achievement-" + achievement.name,
                type: "achievement",
                date: achievement.earnedDate,
                title: achievement.name,
                text: achievement.description,
                note: achievement.notes
            })),
        ...completedGoals.map((goal) => ({
            key: "goal-" + goal.id,
            type: "goal",
            date: goal.completedDate,
            title: goal.text,
            text: null
        })),
        ...sessions
            .filter((session) => session.ended)
            .flatMap((session) => (session.summaries || [])
                .filter((summary) => summary.gameId === game.id)
                .map((summary) => ({
                    key: "summary-" + session.id,
                    type: "summary",
                    date: session.endedDate,
                    title: null,
                    text: summary.text
                }))
            )
    ].sort((a, b) => b.date.localeCompare(a.date));

    const shownItems = timelineItems.filter((item) => shownTypes.includes(item.type));

    const counts = countAchievements([game]);
    const percent = counts.total > 0 ? Math.round((counts.unlocked / counts.total) * 100) : 0;

    return (
        <>
            <section>
                <Link to="/" className="back-link">← Back to games</Link>

                <div className="game-header">
                    <GameCover game={game} className="game-cover game-header-cover" />
                    <div className="game-header-info">
                        <h2>{game.title}</h2>
                        <p className="badge">{getPlatformText(game)}</p>
                        <p className="game-header-stats">
                            {counts.unlocked} / {counts.total} achievements · {percent}% complete
                        </p>
                        <PlatformStat game={game} />
                    </div>
                    <ProgressRing percent={percent} size="large" />
                </div>

                <div className="game-header-actions">
                    {!isAdding && (
                        <button type="button" onClick={() => setIsAdding(true)}>+ Add achievement</button>
                    )}
                    <details>
                        <summary>{game.coverUrl ? "Change cover" : "Add a cover"}</summary>
                        <label htmlFor="cover-url">Cover image link</label>
                        <input
                            type="url"
                            id="cover-url"
                            placeholder="https://..."
                            value={game.coverUrl || ""}
                            onChange={(event) => onUpdateGameCover(game.id, event.target.value)}
                        />
                    </details>
                </div>

                {isAdding && (
                    <div className="add-panel">
                        <AddAchievementForm
                            platform={game.platform}
                            onAddAchievement={(newAchievement) => onAddAchievement(game.id, newAchievement)}
                            onCancel={() => setIsAdding(false)}
                        />
                    </div>
                )}

                {game.achievements.length === 0 && <p>No achievements yet</p>}

                {game.achievements.map((achievement) => (
                    <AchievementCard
                        key={achievement.name}
                        achievement={achievement}
                        onToggle={() => onToggleAchievement(game.id, achievement.name)}
                        onDelete={() => onDeleteAchievement(game.id, achievement.name)}
                        onUpdate={(changes) => onUpdateAchievement(game.id, achievement.name, changes)}
                    />
                ))}
            </section>

            <section>
                <h2>Journal</h2>
                <AddJournalEntryForm
                    onAddEntry={(newEntry) => onAddJournalEntry(game.id, newEntry)}
                />

                {shownTypes.includes("goal") && inProgressGoals.length > 0 && (
                    <>
                        <h3>In progress</h3>
                        {inProgressGoals.map((goal) => (
                            <p key={goal.id}>
                                {goal.text}
                                {goal.target && " (" + goal.progress + " / " + goal.target + ")"}
                            </p>
                        ))}
                    </>
                )}

                <h3>Timeline</h3>
                <FilterDropdown
                    options={filterOptions}
                    shownTypes={shownTypes}
                    onToggle={toggleShownType}
                    onToggleAll={toggleAllShownTypes}
                />
                {timelineItems.length === 0 && <p>Nothing in the timeline yet</p>}
                {timelineItems.length > 0 && shownItems.length === 0 && <p>Nothing matches these filters</p>}
                {shownItems.map((item) => (
                    <TimelineItem
                        key={item.key}
                        item={item}
                        onDelete={item.type === "entry" ? () => onDeleteJournalEntry(item.id) : null}
                    />
                ))}
            </section>
        </>
    );
}

export default GamePage;
