import { Link, useParams } from "react-router";
import AchievementCard from "./AchievementCard";
import AddAchievementForm from "./AddAchievementForm";

function GamePage({ games, onAddAchievement, onToggleAchievement, onDeleteAchievement }) {
    const { gameId } = useParams();
    const game = games.find((game) => game.id === gameId);

    if (!game) {
        return (
            <section>
                <p>Game not found.</p>
                <Link to="/">Back to games</Link>
            </section>
        );
    }

    return (
        <section>
            <Link to="/">Back to games</Link>
            <h2>{game.title}</h2>
            <AddAchievementForm
                onAddAchievement={(newAchievement) => onAddAchievement(game.id, newAchievement)}
            />
            {game.achievements.map((achievement) => (
                <AchievementCard
                    key={achievement.name}
                    achievement={achievement}
                    onToggle={() => onToggleAchievement(game.id, achievement.name)}
                    onDelete={() => onDeleteAchievement(game.id, achievement.name)}
                />
            ))}
        </section>
    );
}

export default GamePage;
