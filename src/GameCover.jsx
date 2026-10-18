function GameCover({ game, className = "game-cover" }) {
    return (
        <div className={className} aria-hidden="true">
            {game.coverUrl ? (
                <>
                    <img className="cover-backdrop" src={game.coverUrl} alt="" />
                    <img className="cover-image" src={game.coverUrl} alt="" />
                </>
            ) : (
                game.title.charAt(0)
            )}
        </div>
    );
}

export default GameCover;
