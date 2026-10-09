import { useState } from "react";

function AddJournalEntryForm({ onAddEntry }) {
    const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));
    const [text, setText] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        onAddEntry({
            id: crypto.randomUUID(),
            date: date,
            text: text
        });

        setText("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="entry-date">Date</label>
            <input
                type="date"
                id="entry-date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
            />

            <label htmlFor="entry-text">Entry</label>
            <textarea
                id="entry-text"
                rows="4"
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
            />

            <button type="submit">Add entry</button>
        </form>
    );
}

export default AddJournalEntryForm;
