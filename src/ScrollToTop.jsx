import { useEffect } from "react";
import { useLocation } from "react-router";

function ScrollToTop() {
    const { pathname, search } = useLocation();
    const jumpsToAchievement = new URLSearchParams(search).has("achievement");

    useEffect(() => {
        if (!jumpsToAchievement) {
            window.scrollTo(0, 0);
        }
    }, [pathname, jumpsToAchievement]);

    return null;
}

export default ScrollToTop;
