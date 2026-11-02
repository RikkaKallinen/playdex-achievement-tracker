import { useEffect, useState } from "react";

function SessionTimer({ startedAt }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timerId = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const twoDigits = (number) => String(number).padStart(2, "0");

    return (
        <span className="session-timer" aria-label={hours + " hours " + minutes + " minutes played"}>
            {hours}:{twoDigits(minutes)}:{twoDigits(seconds)}
        </span>
    );
}

export default SessionTimer;
