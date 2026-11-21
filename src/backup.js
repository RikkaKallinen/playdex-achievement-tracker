// Saves the backup as a file in Downloads, e.g. playdex-backup-2026-11-21.json
export function downloadBackup(backup) {
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "playdex-backup-" + new Date().toLocaleDateString("en-CA") + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
}

// Reads a backup file back in. Throws an error with a message to show if it isn't a Playdex backup
export async function readBackupFile(file) {
    let backup;
    try {
        backup = JSON.parse(await file.text());
    } catch {
        throw new Error("That file couldn't be read. Pick a playdex-backup file.");
    }

    const listsArePresent = ["games", "goals", "sessions", "journalEntries"]
        .every((key) => Array.isArray(backup?.[key]));
    if (backup?.app !== "playdex" || !listsArePresent) {
        throw new Error("That isn't a Playdex backup. Pick a playdex-backup file.");
    }

    return backup;
}
