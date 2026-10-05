import { useState } from "react";

function AddGameForm({ onAddGame }) {
    const [title, setTitle] = useState("");
    const [platform, setPlatform] = useState("steam");
    const [otherPlatform, setOtherPlatform] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        onAddGame({
            id: crypto.randomUUID(),
            title: title,
            platform: platform,
            otherPlatform: platform === "other" ? otherPlatform : "",
            achievements: []
        });

        setTitle("");
        setPlatform("steam");
        setOtherPlatform("");
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
            <button type="submit">Add Game</button>
        </form>
    );
}

export default AddGameForm;