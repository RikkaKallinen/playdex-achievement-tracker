import { Link, useParams } from "react-router";
import AchievementCard from "./AchievementCard";
import AddAchievementForm from "./AddAchievementForm";
import AddJournalEntryForm from "./AddJournalEntryForm";
import JournalEntryCard from "./JournalEntryCard";

function GamePage({ games, journalEntries, onAddAchievement, onToggleAchievement, onDeleteAchievement, onAddJournalEntry, onDeleteJournalEntry }) {
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

    const gameEntries = journalEntries
        .filter((entry) => entry.gameId === game.id)
        .sort((a, b) => b.date.localeCompare(a.date));

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
                {gameEntries.length === 0 && <p>No journal entries yet</p>}
                {gameEntries.map((entry) => (
                    <JournalEntryCard
                        key={entry.id}
                        entry={entry}
                        onDelete={() => onDeleteJournalEntry(entry.id)}
                    />
                ))}
            </section>
        </>
    );
}

export default GamePage;
