# Playdex

**Track it. Log it. Beat it.**

Playdex is a home for everything you play. Sign in with Steam to bring in your library, achievements and hours played, then set goals, time your play sessions and keep a journal of the moments worth remembering.

## Features

- **Steam sign-in and sync**: one click through Steam's own login. Games, achievements, hours played, cover art and genres come straight in.
- **Achievement progress**: progress bars for achievements that count up (e.g. 12 / 20 relics found), plus how rare each unlock is across all players.
- **Goals**: count-up goals or simple tick-off goals, linked to a game, tagged, filtered, and edited with a live card preview.
- **Play sessions**: a timer for tonight's games that you can pause, with notes when you wrap up.
- **Journal**: sessions, unlocks and your own entries in one timeline.
- **Summary**: streaks, rare unlocks, top games, favourite genres and an activity chart.
- **Any platform**: Xbox, PlayStation and other games can be added by hand.
- **Your data, your account**: everything saves to your Steam account automatically, with a JSON backup you can download and restore.

## Built with

| Part | Tools |
| --- | --- |
| Front end | React 19, React Router, Vite, Lucide icons |
| Server | Node.js, Express 5 |
| Database | PostgreSQL on Neon, through Prisma |
| Sign-in | Steam OpenID 2.0 with a signed session cookie |
| Data | Steam Web API |

## How it works

- **Sign-in**: Steam handles the login, so Playdex never sees a password. The server checks Steam's reply directly with Steam before trusting it, then sets an HMAC-signed, HTTP-only cookie.
- **Saving**: your data is stored in five parts (games, goals, sessions, journal, settings). Each part saves on its own shortly after it changes, and only if something actually changed.
- **Privacy**: every data route only ever reads or writes the signed-in person's own data.
- **Steam requests**: the Steam API key stays on the server. If Steam is busy or a profile is private, the server reports that instead of wiping achievements that were already synced.
- **One server online**: Express serves both the API and the built React site.

## Running it on your computer

You'll need Node.js 24 or newer, a [Steam Web API key](https://steamcommunity.com/dev/apikey) and a PostgreSQL database (a free [Neon](https://neon.tech) one works).

1. Install everything:

   ```
   npm install
   ```

2. Create a `.env` file in the project folder:

   ```
   STEAM_API_KEY=your Steam Web API key
   SESSION_SECRET=any long random text
   DATABASE_URL=your PostgreSQL connection string
   ```

3. Create the database table:

   ```
   npx prisma migrate deploy
   ```

4. Start the server and the site in two terminals:

   ```
   npm run server
   npm run dev
   ```

5. Open http://localhost:5173.

## Project layout

```
src/       React app: pages, cards, forms and the welcome page
server/    Express server: Steam sign-in, Steam data and saving
prisma/    Database schema and migrations
```

---

© 2026 Rikka Kallinen. All rights reserved.
