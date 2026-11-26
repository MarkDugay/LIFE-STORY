# LIFE STORY

An original, text-driven life simulation. Pure HTML/CSS/vanilla JS, no build step, no backend. Saves live in your browser's LocalStorage.

## Play locally
Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari). All paths are relative.

## Deploy on GitHub Pages
1. Create a new GitHub repository and upload **the contents of this folder** (so `index.html` is at the repo root).
2. Repo **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute your game is at `https://<username>.github.io/<repo>/` (works on PC and phone).

## What is implemented (Phase 1 core + parts of Phases 2–5)
Main menu, character creation (name, gender, 6 countries/cities, 7 family backgrounds, random), age-up simulation (aging, school, university, jobs, promotions, firing, retirement/pension, business, assets, living costs, debt/interest/bankruptcy, relationships, death checks), 32 context-aware events with weighted selection and no soft-locks, relationships (talk, time, gift, compliment, argue, apologize, borrow, lend, end), dating/marriage/children/adoption, careers (18 jobs), education (high school, bachelor with 13 majors, graduate), property/vehicle buying with mortgages, business ownership, activities, relocation, achievements (12), statistics, life summary with legacy score, generational continuation, 3 save slots with backup/restore, JSON export/import, validation, settings (theme, text size, difficulty, animations).

## Added in phase 2
Crime, prison, insurance, bosses/coworkers, ex-spouses and reconciliation, net-worth chart, icon/manifest/offline cache.

## Added in phase 3
138 events (80 are generated from shared outcome patterns across 10 categories, so their choices are similar within a category), grandparents and relatives, visa applications for moving abroad, property renovations and condition, business expansion and loans, sound effects and ambient music (WebAudio, toggles in Settings), and JSON data files in `data/` (loaded on GitHub Pages; the same data is built into `js/data.js` as an offline/local fallback).

## Not yet implemented
Hand-written unique events up to 300, authored music/sound files, deeper relative storylines, and event data in JSON (events contain code conditions, so they stay in JS).

## Tests
`node test.js` (engine simulation of 300 lives) and `node uitest.js` (headless UI flow with stubs).
