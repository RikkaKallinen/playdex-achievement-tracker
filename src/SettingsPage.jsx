import { platformNames, accentColors, fontOptions } from "./data";

function SettingsPage({ games, hiddenPlatforms, onTogglePlatform, accentColor, onChangeAccent, fontChoice, onChangeFont }) {
    return (
        <section>
            <h2>Settings</h2>
            <h3>Accent color</h3>
            <p>
                {Object.keys(accentColors).map((color) => (
                    <button
                        key={color}
                        type="button"
                        className={color === accentColor ? "swatch-button selected" : "swatch-button"}
                        onClick={() => onChangeAccent(color)}
                    >
                        <span className="swatch" data-accent={color} />
                        {accentColors[color]}
                    </button>
                ))}
            </p>
            <h3>Font</h3>
            <p>
                {Object.keys(fontOptions).map((font) => (
                    <button
                        key={font}
                        type="button"
                        data-font={font}
                        className={font === fontChoice ? "swatch-button font-preview selected" : "swatch-button font-preview"}
                        onClick={() => onChangeFont(font)}
                    >
                        {fontOptions[font]}
                    </button>
                ))}
            </p>
            <h3>Summary sections</h3>
            <p>A section appears on the Summary page once you have a game on that platform. Untick one to hide it.</p>
            {Object.keys(platformNames).map((platform) => {
                const hasGames = games.some((game) => game.platform === platform);

                return (
                    <p key={platform}>
                        <label>
                            <input
                                type="checkbox"
                                checked={hasGames && !hiddenPlatforms.includes(platform)}
                                onChange={() => onTogglePlatform(platform)}
                                disabled={!hasGames}
                            />
                            {" "}{platformNames[platform]}
                            {!hasGames && " (no games yet)"}
                        </label>
                    </p>
                );
            })}
        </section>
    );
}

export default SettingsPage;
