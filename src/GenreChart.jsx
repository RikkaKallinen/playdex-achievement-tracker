import { getMainGenre } from "./summaryStats";

const genreColors = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];
const radius = 60;
const circumference = 2 * Math.PI * radius;
const gap = 2;

function GenreChart({ games }) {
    const gamesWithGenres = games.filter((game) => getMainGenre(game));

    if (gamesWithGenres.length === 0) {
        return (
            <div className="genre-chart">
                <h3 className="label">Genres</h3>
                <p className="stat-detail">Sync with Steam in Settings to see your genres.</p>
            </div>
        );
    }

    const genreCounts = {};
    for (const game of gamesWithGenres) {
        const genre = getMainGenre(game);
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }

    const sortedGenres = Object.entries(genreCounts)
        .filter(([name]) => name !== "Other")
        .sort((a, b) => b[1] - a[1]);
    const slices = sortedGenres.slice(0, genreColors.length).map(([name, count], index) => ({
        name: name,
        count: count,
        color: genreColors[index]
    }));
    const otherCount = (genreCounts.Other || 0)
        + sortedGenres.slice(genreColors.length).reduce((sum, [, count]) => sum + count, 0);
    if (otherCount > 0) {
        slices.push({ name: "Other", count: otherCount, color: "var(--text-muted)" });
    }

    const totalCount = slices.reduce((sum, slice) => sum + slice.count, 0);
    const placedSlices = slices.reduce((placed, slice) => {
        const previous = placed[placed.length - 1];
        const start = previous ? previous.start + previous.length : 0;
        return [...placed, { ...slice, start: start, length: (slice.count / totalCount) * circumference }];
    }, []);

    return (
        <div className="genre-chart">
            <h3 className="label">Main genres</h3>
            <div className="genre-body">
                <svg viewBox="0 0 160 160" className="genre-donut" role="img" aria-label="Main genre of each game">
                    <mask id="genre-reveal">
                        <circle
                            className="genre-reveal"
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            stroke="white"
                            strokeWidth="24"
                            strokeDasharray={circumference}
                            strokeDashoffset="0"
                            transform="rotate(-90 80 80)"
                        />
                    </mask>
                    <g mask="url(#genre-reveal)">
                        {placedSlices.map((slice) => {
                            const visibleLength = Math.max(slice.length - gap, 0);

                            return (
                                <circle
                                    key={slice.name}
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    fill="none"
                                    stroke={slice.color}
                                    strokeWidth="22"
                                    strokeDasharray={visibleLength + " " + (circumference - visibleLength)}
                                    strokeDashoffset={-slice.start}
                                    transform="rotate(-90 80 80)"
                                >
                                    <title>{slice.name}: {slice.count} games</title>
                                </circle>
                            );
                        })}
                    </g>
                    <text x="80" y="78" textAnchor="middle" className="genre-total">{gamesWithGenres.length}</text>
                    <text x="80" y="96" textAnchor="middle" className="genre-total-label">games</text>
                </svg>

                <ul className="genre-legend">
                    {slices.map((slice) => (
                        <li key={slice.name}>
                            <span className="genre-swatch" style={{ background: slice.color }} />
                            <span className="genre-name">{slice.name}</span>
                            <span className="genre-count">{slice.count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default GenreChart;
