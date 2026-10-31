import { useState } from "react";

function AddGameForm({ onAddGame, onCancel }) {
    const [title, setTitle] = useState("");
    const [platform, setPlatform] = useState("steam");
    const [otherPlatform, setOtherPlatform] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [steamLink, setSteamLink] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        const linkMatch = steamLink.match(/\/app\/(\d+)/);
        const steamAppId = platform === "steam" && linkMatch ? Number(linkMatch[1]) : null;
        const steamCoverUrl = steamAppId ? "https://cdn.cloudflare.steamstatic.com/steam/apps/" + steamAppId + "/header.jpg" : "";

        onAddGame({
            id: crypto.randomUUID(),
            title: title,
            platform: platform,
            otherPlatform: platform === "other" ? otherPlatform : "",
            coverUrl: coverUrl || steamCoverUrl,
            steamAppId: steamAppId,
            achievements: []
        });

        setTitle("");
        setPlatform("steam");
        setOtherPlatform("");
        setCoverUrl("");
        setSteamLink("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="game-title">Game title</label>
            <input
                type="text"
                id="game-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
            />

            <label htmlFor="platform">Platform</label>
            <select
                id="platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
            >
                <option value="steam">Steam</option>
                <option value="xbox">Xbox</option>
                <option value="playstation">PlayStation</option>
                <option value="other">Other</option>
            </select>

            {platform === "other" && (
                <>
                    <label htmlFor="other-platform">Platform name</label>
                    <input
                        type="text"
                        id="other-platform"
                        value={otherPlatform}
                        onChange={(event) => setOtherPlatform(event.target.value)}
                        required
                    />
                </>
            )}

            {platform === "steam" && (
                <>
                    <label htmlFor="steam-link">Steam store link (optional)</label>
                    <input
                        type="url"
                        id="steam-link"
                        placeholder="https://store.steampowered.com/app/..."
                        value={steamLink}
                        onChange={(event) => setSteamLink(event.target.value)}
                    />
                </>
            )}

            <label htmlFor="game-cover">Cover image link (optional)</label>
            <input
                type="url"
                id="game-cover"
                placeholder="https://..."
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
            />

            <div className="button-row">
                <button type="submit">Add Game</button>
                <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default AddGameForm;