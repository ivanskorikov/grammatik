# Grammatik

Interactive German grammar exercises for **CEFR A1 and A2** levels.

**Repository:** [github.com/ivanskorikov/grammatik](https://github.com/ivanskorikov/grammatik)

## Features

- Grammar sections with short theory summaries and worked examples
- Interactive exercises: fill-in-the-blank, word bank, word order, pick-and-type
- **Check** button with mistake highlighting and explanatory tooltips
- Progress saved in browser localStorage

## Development

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

Static output is in `dist/`. Deploy to **GitHub Pages**:

1. Push to `main`
2. Repo → **Settings** → **Pages** → set **Source** to **GitHub Actions** (required before the first deploy succeeds)
3. Re-run the failed **Deploy** workflow from the **Actions** tab, or push again

Live URL: `https://ivanskorikov.github.io/grammatik/`

Alternatively, connect the repo to **Netlify** — `netlify.toml` is included.

## Project structure

```
content/        Curriculum, theory summaries, and section JSON (shipped with the app)
scripts/        Content parser (optional; requires private source worksheets locally)
src/            React app
public/         Static assets
```

## Regenerating content (maintainers only)

Exercise JSON in `content/sections/` is committed to the repo so the app builds without private source files. To re-parse worksheets locally, place source HTML in `materials/html_textbook/grammar_pages/` (not included in this repository) and run:

```bash
npm run parse
```

Theory summaries are edited directly in `content/summaries.json`.

## License

This project is licensed under the [MIT License](LICENSE).

The MIT license applies to the application source code and the curated theory summaries in `content/summaries.json`.

## Content attribution

Exercise prompts in `content/sections/` are adapted from [Nancy Thuleen's German teaching materials](https://www.nthuleen.com/teach/grammar.html). The original worksheets are © Nancy Thuleen; this app is an independent educational project and is not affiliated with or endorsed by the author.

Theory overviews in `content/summaries.json` are original summaries written for this app and are included under the MIT license above.
