import { Link, useParams } from "react-router";
import AchievementCard from "./AchievementCard";
import AddAchievementForm from "./AddAchievementForm";
import AddJournalEntryForm from "./AddJournalEntryForm";
import TimelineItem from "./TimelineItem";
import { getGoalStatus } from "./goalStatus";

function GamePage({ games, goals, sessions, journalEntries, onAddAchievement, onToggleAchievement, onDeleteAchievement, onAddJournalEntry, onDeleteJournalEntry }) {
    const { gameId } = useParams();
    const game = games.find((game) => game.id === gameId);

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
                text: achievement.description
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

    return (
        <>
            <section>
                <Link to="/">Back to games</Link>
                <h2>{game.title}</h2>
                <AddAchievementForm
                    onAddAchievement={(newAchievement) => onAddAchievement(game.id, newAchievement)}
                />
                {game.achievements.map((achievement) => (
                    <AchievementCard
                        key={achievement.name}
                        achievement={achievement}
                        onToggle={() => onToggleAchievement(game.id, achievement.name)}
                        onDelete={() => onDeleteAchievement(game.id, achievement.name)}
                    />
                ))}
            </section>

            <section>
                <h2>Journal</h2>
                <AddJournalEntryForm
                    onAddEntry={(newEntry) => onAddJournalEntry(game.id, newEntry)}
                />

                {inProgressGoals.length > 0 && (
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
                {timelineItems.length === 0 && <p>Nothing in the timeline yet</p>}
                {timelineItems.map((item) => (
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
