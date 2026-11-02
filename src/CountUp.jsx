import { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

const duration = 1200;

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function CountUp({ value }) {
    const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
    const shownRef = useRef(shown);
    const [ref, inView] = useInView();

    useEffect(() => {
        if (!inView) {
            return;
        }

        const from = shownRef.current;
        const length = prefersReducedMotion() ? 0 : duration;
        let startTime = null;
        let frame;

        function step(time) {
            if (startTime === null) {
                startTime = time;
            }

            const progress = length === 0 ? 1 : Math.min((time - startTime) / length, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const next = Math.round(from + (value - from) * eased);

            shownRef.current = next;
            setShown(next);

            if (progress < 1) {
                frame = requestAnimationFrame(step);
            }
        }

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [value, inView]);

    return <span ref={ref}>{shown.toLocaleString()}</span>;
}

export default CountUp;
