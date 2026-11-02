import { useEffect, useLayoutEffect, useRef } from "react";

function placeHighlight(highlight, selector) {
    const selected = highlight.parentElement.querySelector(selector);
    if (!selected) {
        highlight.style.opacity = "0";
        return;
    }

    highlight.style.opacity = "1";
    highlight.style.setProperty("--left", selected.offsetLeft + "px");
    highlight.style.setProperty("--top", selected.offsetTop + "px");
    highlight.style.setProperty("--width", selected.offsetWidth + "px");
    highlight.style.setProperty("--height", selected.offsetHeight + "px");
}

// Sits inside a row of chips or tabs and glides to whichever one matches selector
function SlidingHighlight({ className, selector = ".selected" }) {
    const ref = useRef(null);
    const hasPlaced = useRef(false);

    useLayoutEffect(() => {
        const highlight = ref.current;

        if (hasPlaced.current) {
            placeHighlight(highlight, selector);
            return;
        }

        // The very first time, jump straight to the selected one instead of sliding in from the corner
        highlight.style.transition = "none";
        placeHighlight(highlight, selector);
        highlight.getBoundingClientRect();
        highlight.style.transition = "";
        hasPlaced.current = true;
    });

    useEffect(() => {
        const highlight = ref.current;
        const observer = new ResizeObserver(() => placeHighlight(highlight, selector));
        for (const child of highlight.parentElement.children) {
            observer.observe(child);
        }

        return () => observer.disconnect();
    }, [selector]);

    return <span ref={ref} className={"sliding-highlight " + className} aria-hidden="true" />;
}

export default SlidingHighlight;
