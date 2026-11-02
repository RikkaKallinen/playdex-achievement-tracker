import { useState } from "react";
import { Link } from "react-router";
import { NotebookPen, Target, Trophy, X, Zap } from "lucide-react";
import { groupByDay } from "./journalFeed";
import { cleanDescription } from "./summaryStats";
import { AchievementStoryForm, SessionNoteForm } from "./JournalForms";
import SlidingHighlight from "./SlidingHighlight";

const filters = [
    { value: "all", label: "All" },
    { value: "session", label: "Sessions" },
    { value: "entry", label: "Entries" },
    { value: "goal", label: "Goals" },
    { value: "unlocks", label: "Unlocks" }
];

const daysPerPage = 14;

function formatDay(date) {
    return new Date(date + "T00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatMinutes(minutes) {
    if (minutes < 60) {
        return minutes + "m";
    }

    return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
}

function GameLinks({ games, toJournal = false, currentGameId = null }) {
    const shownGames = games.filter((game) => game && game.id !== currentGameId);
    if (shownGames.length === 0) {
        return null;
    }

    return (
        <span className="journal-games">
            {shownGames.map((game) => (
                <Link
                    key={game.id}
                    to={"/games/" + game.id + (toJournal ? "?tab=journal" : "")}
                    className="journal-game"
                >
                    {game.title}
                </Link>
            ))}
        </span>
    );
}

function DeleteButton({ label, onDelete }) {
    return (
        <button
            type="button"
            className="icon-button journal-delete"
            aria-label={"Delete " + label}
            onClick={() => {
                if (confirm("Delete this " + label + "? This can't be undone.")) {
                    onDelete();
                }
            }}
        >
            <X size={16} aria-hidden="true" />
        </button>
    );
}

function JournalThumb({ game, Icon, currentGameId }) {
    if (!game || game.id === currentGameId) {
        return <span className="journal-icon" aria-hidden="true"><Icon size={16} /></span>;
    }

    return (
        <span className="journal-thumb" aria-hidden="true">
            {game.coverUrl ? <img src={game.coverUrl} alt="" /> : game.title.charAt(0)}
        </span>
    );
}

function TypePill({ Icon, label }) {
    return (
        <span className="journal-type">
            <Icon size={12} aria-hidden="true" />
            {label}
        </span>
    );
}

function JournalItem({ item, games, currentGameId, onDeleteSession, onDeleteEntry, onDeleteGoal, onAddSessionNote, onUpdateAchievement, onAddEntry }) {
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [showAllUnlocks, setShowAllUnlocks] = useState(false);
    const [isAddingStory, setIsAddingStory] = useState(false);

    if (item.type === "session") {
        return (
            <article className="journal-item session">
                <JournalThumb
                    game={item.games.find((game) => game.id !== currentGameId)}
                    Icon={Zap}
                    currentGameId={currentGameId}
                />
                <div className="journal-body">
                    <GameLinks games={item.games} toJournal currentGameId={currentGameId} />
                    <p className="journal-kind">
                        <TypePill Icon={Zap} label="Session" />
                        {item.loggedLater && " Logged later"}
                        {item.minutes !== null && <> · {formatMinutes(item.minutes)}</>}
                        {item.goalsTotal > 0 && <> · {item.goalsDone} of {item.goalsTotal} goals done</>}
                    </p>
                    {item.summaries.map((summary, index) => (
                        <blockquote key={index} className="journal-quote">
                            {summary.game && <span className="journal-quote-game">{summary.game.title}</span>}
                            {summary.text}
                        </blockquote>
                    ))}
                    {isAddingNote ? (
                        <div className="add-panel journal-note-panel">
                            <SessionNoteForm
                                games={games}
                                sessionGames={item.games}
                                onAdd={(note) => {
                                    onAddSessionNote(item.sourceId, note);
                                    setIsAddingNote(false);
                                }}
                                onCancel={() => setIsAddingNote(false)}
                            />
                        </div>
                    ) : (
                        <button type="button" className="button-quiet journal-add-note" onClick={() => setIsAddingNote(true)}>
                            + Add a note
                        </button>
                    )}
                </div>
                <DeleteButton label="session" onDelete={() => onDeleteSession(item.sourceId)} />
            </article>
        );
    }

    if (item.type === "entry") {
        return (
            <article className="journal-item">
                <JournalThumb game={item.game} Icon={NotebookPen} currentGameId={currentGameId} />
                <div className="journal-body">
                    <GameLinks games={[item.game]} toJournal currentGameId={currentGameId} />
                    <p className="journal-kind"><TypePill Icon={NotebookPen} label="Journal entry" /></p>
                    <p className="journal-text">{item.text}</p>
                </div>
                <DeleteButton label="journal entry" onDelete={() => onDeleteEntry(item.sourceId)} />
            </article>
        );
    }

    if (item.type === "goal") {
        return (
            <article className="journal-item">
                <JournalThumb game={item.game} Icon={Target} currentGameId={currentGameId} />
                <div className="journal-body">
                    <GameLinks games={[item.game]} toJournal currentGameId={currentGameId} />
                    <p className="journal-kind"><TypePill Icon={Target} label="Goal completed" /></p>
                    <p className="journal-text">{item.text}</p>
                </div>
                <DeleteButton label="goal" onDelete={() => onDeleteGoal(item.sourceId)} />
            </article>
        );
    }

    return (
        <article className="journal-item">
            <JournalThumb game={item.game} Icon={Trophy} currentGameId={currentGameId} />
            <div className="journal-body">
                <GameLinks games={[item.game]} currentGameId={currentGameId} />
                <p className="journal-kind">
                    <TypePill Icon={Trophy} label="Achievements" />
                    {" "}{item.achievements.length} unlocked
                </p>
                <ul className="journal-unlocks">
                    {(showAllUnlocks ? item.achievements : item.achievements.slice(0, 6)).map((achievement) => (
                        <li key={achievement.name}>
                            <Link
                                to={"/games/" + item.game.id + "?achievement=" + encodeURIComponent(achievement.name)}
                                title={cleanDescription(achievement.description)}
                            >
                                {achievement.iconUrl
                                    ? <img src={achievement.iconUrl} alt="" />
                                    : <span aria-hidden="true">🏆</span>}
                                {achievement.name}
                            </Link>
                        </li>
                    ))}
                    {item.achievements.length > 6 && (
                        <li>
                            <button
                                type="button"
                                className="journal-more"
                                aria-expanded={showAllUnlocks}
                                onClick={() => setShowAllUnlocks(!showAllUnlocks)}
                            >
                                {showAllUnlocks ? "Show less" : "+" + (item.achievements.length - 6) + " more"}
                            </button>
                        </li>
                    )}
                </ul>
                {(item.dayNotes || []).map((note) => (
                    <blockquote key={note.id} className="journal-quote journal-day-note">
                        <span className="journal-quote-game">General</span>
                        {note.text}
                        <button
                            type="button"
                            className="icon-button journal-note-delete"
                            aria-label="Delete this note"
                            onClick={() => {
                                if (confirm("Delete this note? This can't be undone.")) {
                                    onDeleteEntry(note.id);
                                }
                            }}
                        >
                            <X size={14} aria-hidden="true" />
                        </button>
                    </blockquote>
                ))}
                {item.achievements.filter((achievement) => achievement.notes).map((achievement) => (
                    <blockquote key={achievement.name} className="journal-quote">
                        <span className="journal-quote-game">{achievement.name}</span>
                        {achievement.notes}
                    </blockquote>
                ))}
                {isAddingStory ? (
                    <div className="add-panel journal-note-panel">
                        <AchievementStoryForm
                            achievements={item.achievements}
                            onSave={(achievementName, text) => {
                                if (achievementName) {
                                    onUpdateAchievement(item.game.id, achievementName, { notes: text });
                                } else if (text) {
                                    onAddEntry(item.game.id, { id: crypto.randomUUID(), date: item.date, text: text });
                                }
                                setIsAddingStory(false);
                            }}
                            onCancel={() => setIsAddingStory(false)}
                        />
                    </div>
                ) : (
                    <button type="button" className="button-quiet journal-add-note" onClick={() => setIsAddingStory(true)}>
                        + Add a story
                    </button>
                )}
            </div>
        </article>
    );
}

function JournalFeedList({ feed, games, currentGameId = null, emptyMessage, ...handlers }) {
    const [shownType, setShownType] = useState("all");
    const [shownDays, setShownDays] = useState(daysPerPage);

    const filteredFeed = shownType === "all" ? feed : feed.filter((item) => item.type === shownType);
    const days = groupByDay(filteredFeed);

    return (
        <>
            <div className="filter-chips">
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        className={filter.value === shownType ? "chip selected" : "chip"}
                        onClick={() => {
                            setShownType(filter.value);
                            setShownDays(daysPerPage);
                        }}
                    >
                        {filter.label} ({filter.value === "all" ? feed.length : feed.filter((item) => item.type === filter.value).length})
                    </button>
                ))}
                <SlidingHighlight className="chip-highlight" />
            </div>

            {days.length === 0 && <p>{emptyMessage}</p>}

            {days.slice(0, shownDays).map((day) => (
                <div key={day.date} className="journal-day">
                    <h3 className="journal-day-title">{formatDay(day.date)}</h3>
                    {day.items.map((item) => (
                        <JournalItem
                            key={item.id}
                            item={item}
                            games={games}
                            currentGameId={currentGameId}
                            {...handlers}
                        />
                    ))}
                </div>
            ))}

            {days.length > shownDays && (
                <div className="button-row">
                    <button type="button" className="button-quiet" onClick={() => setShownDays(shownDays + daysPerPage)}>
                        Show older days
                    </button>
                </div>
            )}
        </>
    );
}

export default JournalFeedList;
