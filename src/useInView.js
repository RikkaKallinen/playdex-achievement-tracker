import { useEffect, useRef, useState } from "react";

// Becomes true the first time the element scrolls into view, then stays true
export function useInView() {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || inView) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, { rootMargin: "0px 0px -15% 0px" });

        observer.observe(element);
        return () => observer.disconnect();
    }, [inView]);

    return [ref, inView];
}
