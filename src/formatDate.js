export function formatDate(dateString) {
    return new Date(dateString + "T00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}
