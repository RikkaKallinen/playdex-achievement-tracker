function ProgressRing({ percent }) {
    return (
        <div className="progress-ring" style={{ "--percent": percent }}>
            <span>{percent}%</span>
        </div>
    );
}

export default ProgressRing;
