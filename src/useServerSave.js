import { useEffect, useRef } from "react";

// Saves one part of your Playdex (e.g. "goals") to your account a moment after it changes.
// - Waits 400 ms so a burst of changes (typing a progress number, a Steam sync) becomes one save
// - Only while `enabled` (signed in and your data has loaded). The moment it switches on, whatever is showing
//   counts as already saved, so data that just came from the server isn't sent straight back
// - Skips saving when nothing actually changed
export function useServerSave(part, value, enabled) {
    const lastSaved = useRef(null);
    const wasEnabled = useRef(false);

    useEffect(() => {
        if (!enabled) {
            wasEnabled.current = false;
            return;
        }

        const json = JSON.stringify(value);
        if (!wasEnabled.current) {
            wasEnabled.current = true;
            lastSaved.current = json;
            return;
        }

        if (json === lastSaved.current) {
            return;
        }

        const timer = setTimeout(() => {
            fetch("/api/data/" + part, { method: "PUT", headers: { "Content-Type": "application/json" }, body: json })
                .then((response) => {
                    if (response.ok) {
                        lastSaved.current = json;
                    } else {
                        console.error("Couldn't save your " + part, response.status);
                    }
                })
                .catch((error) => console.error("Couldn't save your " + part, error));
        }, 400);

        return () => clearTimeout(timer);
    }, [part, value, enabled]);
}

// Sends every part at once, for moving this browser's data into a new account. Resolves once all are saved
export async function saveAllParts(parts) {
    const responses = await Promise.all(Object.entries(parts).map(([part, value]) =>
        fetch("/api/data/" + part, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) })
    ));
    if (responses.some((response) => !response.ok)) {
        throw new Error("Some of your data didn't save");
    }
}
