import { useState } from "react";
import { buildJournalFeed } from "./journalFeed";
import { NewEntryForm, PastSessionForm } from "./JournalForms";
import JournalFeedList from "./JournalFeedList";

function JournalPage({ games, goals, sessions, journalEntries, onDeleteSession, onDeleteEntry, onDeleteGoal, onAddEntry, onLogPastSession, onAddSessionNote, onUpdateAchievement, onUpdateEntry, onUpdateSessionSummaries }) {
    const [openForm, setOpenForm] = useState(null);
    const activeGames = games.filter((game) => !game.deleted);
    const feed = buildJournalFeed({ games, goals, sessions, journalEntries });

    return (
        <section>
            <h2>Journal</h2>

            {openForm === null && (
                <div className="game-header-actions">
                    <button type="button" onClick={() => setOpenForm("entry")}>+ New entry</button>
                    <button type="button" className="button-quiet" onClick={() => setOpenForm("session")}>+ Log a past session</button>
                </div>
            )}

            {openForm === "entry" && (
                <div className="add-panel">
                    <NewEntryForm
                        games={activeGames}
                        onAdd={(gameId, entry) => {
                            onAddEntry(gameId, entry);
                            setOpenForm(null);
                        }}
                        onCancel={() => setOpenForm(null)}
                    />
                </div>
            )}

            {openForm === "session" && (
                <div className="add-panel">
                    <PastSessionForm
                        games={activeGames}
                        onAdd={(session) => {
                            onLogPastSession(session);
                            setOpenForm(null);
                        }}
                        onCancel={() => setOpenForm(null)}
                    />
                </div>
            )}

            <JournalFeedList
                feed={feed}
                games={activeGames}
                emptyMessage="Nothing here yet. Play a session, write a journal entry, or unlock something!"
                onAddSessionNote={onAddSessionNote}
                onUpdateAchievement={onUpdateAchievement}
                onAddEntry={onAddEntry}
                onDeleteSession={onDeleteSession}
                onDeleteEntry={onDeleteEntry}
                onUpdateEntry={onUpdateEntry}
                onUpdateSessionSummaries={onUpdateSessionSummaries}
                onDeleteGoal={onDeleteGoal}
            />
        </section>
    );
}

export default JournalPage;
