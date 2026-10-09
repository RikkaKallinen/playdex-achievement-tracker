import { formatDate } from "./formatDate";

function JournalEntryCard({ entry, onDelete }) {
    return (
        <article className="journal-entry">
            <p>
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            </p>
            <p>{entry.text}</p>
            <button onClick={onDelete}>Delete</button>
        </article>
    );
}

export default JournalEntryCard;
