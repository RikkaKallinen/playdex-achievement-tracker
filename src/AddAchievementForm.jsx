import { useState } from "react";

function AddAchievementForm({ onAddAchievement }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        onAddAchievement({
            name: name,
            description: description,
            source: "manual",
            earned: false,
            earnedDate: null
        });

        setName("");
        setDescription("");
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

            <button type="submit">Add achievement</button>
        </form>
    );
}

export default AddAchievementForm;