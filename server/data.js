import express from "express";
import { prisma } from "./db.js";
import { getSignedInSteamId } from "./auth.js";

// The parts of a person's Playdex, matching the backup file. "settings" holds hiddenPlatforms, accentColor, fontChoice and profile
const parts = ["games", "goals", "sessions", "journalEntries", "settings"];

// Whose data it is always comes from the sign-in cookie, never from the request, so nobody can read or overwrite someone else's
function requireSignIn(request, response) {
    const steamId = getSignedInSteamId(request);
    if (!steamId) {
        response.status(401).json({ error: "Sign in through Steam first" });
    }
    return steamId;
}

export function addDataRoutes(app) {
    // Everything saved for the signed-in person, e.g. { games: [...], goals: [...] }. Parts never saved are left out
    app.get("/api/data", async (request, response) => {
        const steamId = requireSignIn(request, response);
        if (!steamId) {
            return;
        }

        const rows = await prisma.savedPart.findMany({ where: { steamId: steamId } });
        response.json(Object.fromEntries(rows.map((row) => [row.part, row.data])));
    });

    // Saves one part, replacing what was there. The games list can be a few MB (achievements, covers), hence the higher limit
    app.put("/api/data/:part", express.json({ limit: "25mb" }), async (request, response) => {
        const steamId = requireSignIn(request, response);
        if (!steamId) {
            return;
        }

        const part = request.params.part;
        if (!parts.includes(part) || request.body === undefined) {
            response.status(400).json({ error: "Unknown part or nothing to save" });
            return;
        }

        await prisma.savedPart.upsert({
            where: { steamId_part: { steamId: steamId, part: part } },
            create: { steamId: steamId, part: part, data: request.body },
            update: { data: request.body }
        });
        response.json({ saved: part });
    });
}
