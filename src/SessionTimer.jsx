import { useEffect, useState } from "react";

function SessionTimer({ startedAt, pausedMs = 0, pausedAt = null }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timerId = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timerId);
    }, []);

    // While paused, the clock stops at the moment Pause was pressed
    const stoppedAt = pausedAt || now;
    const totalSeconds = Math.max(0, Math.floor((stoppedAt - startedAt - pausedMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const twoDigits = (number) => String(number).padStart(2, "0");

    return (
        <span className={pausedAt ? "session-timer paused" : "session-timer"} aria-label={hours + " hours " + minutes + " minutes played"}>
            {hours}:{twoDigits(minutes)}:{twoDigits(seconds)}
        </span>
    );
}

export default SessionTimer;
