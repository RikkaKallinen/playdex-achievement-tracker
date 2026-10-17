import { useState } from "react";
import { trophyTiers } from "./data";

function AddAchievementForm({ platform, onAddAchievement }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [gamerscore, setGamerscore] = useState("");
    const [trophyTier, setTrophyTier] = useState("bronze");
    const [iconUrl, setIconUrl] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        onAddAchievement({
            name: name,
            description: description,
            source: "manual",
            gamerscore: platform === "xbox" ? Number(gamerscore) : null,
            trophyTier: platform === "playstation" ? trophyTier : null,
            iconUrl: iconUrl,
            earned: false,
            earnedDate: null
        });

        setName("");
        setDescription("");
        setGamerscore("");
        setTrophyTier("bronze");
        setIconUrl("");
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="achievement-name">Achievement name</label>
            <input
                type="text"
                id="achievement-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />

            <label htmlFor="achievement-description">Description</label>
            <input
                type="text"
                id="achievement-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
            />

            {platform === "xbox" && (
                <>
                    <label htmlFor="achievement-gamerscore">Gamerscore</label>
                    <input
                        type="number"
                        id="achievement-gamerscore"
                        min="0"
                        value={gamerscore}
                        onChange={(event) => setGamerscore(event.target.value)}
                        required
                    />
                </>
            )}

            {platform === "playstation" && (
                <>
                    <label htmlFor="achievement-trophy">Trophy tier</label>
                    <select
                        id="achievement-trophy"
                        value={trophyTier}
                        onChange={(event) => setTrophyTier(event.target.value)}
                    >
                        {Object.keys(trophyTiers).map((tier) => (
                            <option key={tier} value={tier}>{trophyTiers[tier]}</option>
                        ))}
                    </select>
                </>
            )}

            <label htmlFor="achievement-icon">Icon image link (optional)</label>
            <input
                type="url"
                id="achievement-icon"
                placeholder="https://..."
                value={iconUrl}
                onChange={(event) => setIconUrl(event.target.value)}
            />

            <button type="submit">Add achievement</button>
        </form>
    );
}

export default AddAchievementForm;
