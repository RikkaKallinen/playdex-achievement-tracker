import { formatDate } from "./formatDate";

const typeLabels = {
    entry: "Journal entry",
    achievement: "Achievement unlocked",
    goal: "Goal completed",
    summary: "Session summary"
};

function TimelineItem({ item, onDelete }) {
    return (
        <article className="timeline-item">
            <p>
                <strong>{typeLabels[item.type]}</strong>
                {" · "}
                <time dateTime={item.date}>{formatDate(item.date)}</time>
            </p>
            {item.title && <h3>{item.title}</h3>}
            {item.text && <p>{item.text}</p>}
            {onDelete && <button onClick={onDelete}>Delete</button>}
        </article>
    );
}

export default TimelineItem;
