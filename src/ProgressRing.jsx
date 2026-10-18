function ProgressRing({ percent, size }) {
    const ringClass = size === "large" ? "progress-ring large" : "progress-ring";

    return (
        <div className={ringClass} style={{ "--percent": percent }}>
            <span>{percent}%</span>
        </div>
    );
}

export default ProgressRing;
