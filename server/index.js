import express from "express";

const app = express();
const port = 3001;

app.get("/api/steam/games", async (request, response) => {
    const params = new URLSearchParams({
        key: process.env.STEAM_API_KEY,
        steamid: request.query.steamId,
        include_appinfo: "true"
    });

    const steamResponse = await fetch("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?" + params);

    if (!steamResponse.ok) {
        response.status(502).json({ error: "Steam request failed" });
        return;
    }

    const data = await steamResponse.json();
    response.json(data.response.games || []);
});

app.listen(port, () => {
    console.log("Playdex server running on http://localhost:" + port);
});
