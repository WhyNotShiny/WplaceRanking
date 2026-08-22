# Wplace Region Leaderboard

An interactive map and leaderboard for [wplace.live](https://wplace.live), a collaborative
pixel-art canvas covering the whole world. The globe is divided into a 500×500 grid of
regions; this project tracks how many pixels have been painted in each one, rolls that up
to country level, and plots it all on a colour-coded map with historical snapshots you can
step through over time.

**Unofficial fan project — not affiliated with wplace.live.**

**Completely vibe coded with Claude.**

---

## What's in this repo
 
| Path | What it is |
|---|---|
| `index.html`, `styles.css`, `js/*.js` | The dashboard itself — a static, dependency-light web app |
| `wplace_leaderboard_builder.cs` | The C# tool that scrapes wplace's API and produces a new snapshot |
| `regions.json` | Lookup table (region id → name/number/country) used by the builder |
| `Leaderboard_files/region_leaderboard_YYYY-MM-DD.csv` | One CSV snapshot per date |
| `Leaderboard_files/manifest.json` | Plain JSON array of available snapshot dates, used by the dashboard to discover CSVs |
| `.github/workflows/snapshot.yml` | Scheduled GitHub Actions workflow that runs the builder and commits a new snapshot automatically |
 
## Features
 
- **Regions & Countries views** — sortable, searchable leaderboards for both, with medal
  styling for the top 3
- **Map heatmap** — log-scale colour overlay showing pixel density per region, with a
  separate toggle to hide just the heatmap (keep the base map) or just the base map (keep
  the heatmap) — useful for seeing exactly which regions belong to a country
- **Timeline slider** — step through every available snapshot date; each CSV is cached
  client-side after first load so switching dates is instant
- **Stats tab** — distribution breakdown across all regions (median, trimmed mean, std
  deviation, percentiles) and per-country aggregates
- **Click-to-select** — click a region on the map or in the list to fly to it and see its
  rank, pixel count, and a link to open it directly on wplace.live; click a country to
  highlight all of its regions at once
## How the data pipeline works
 
```
wplace_leaderboard_builder.cs  →  region_leaderboard_YYYY-MM-DD.csv + manifest.json
        (runs ~2h, weekly,             (committed to Leaderboard_files/)
         via GitHub Actions)
                                              ↓
                                   the dashboard's js/ files fetch manifest.json,
                                   downloads the CSVs on demand,
                                   parses + renders client-side
```
 
The dashboard has no backend — it's static files reading static files, served straight
from GitHub via `raw.githubusercontent.com`. There's nothing to host or run server-side.
 
### The builder (`wplace_leaderboard_builder.cs`)
 
Requires the .NET 8 SDK. Two phases, run in this order so the busiest regions get exact
numbers first:
 
1. **Phase 2 first** — fetches each country's `/leaderboard/region/all-time/{countryId}`
   endpoint, which returns **exact** totals for that country's top-50 regions.
2. **Phase 1** — for every region Phase 2 didn't already cover, sums the top-50 individual
   players' contributions in that region. This is a **lower bound**, not the true total
   (see [Known limitation](#known-limitation-data-accuracy) below).
Run it manually:
```
dotnet run
```
It'll prompt for a scanner checkpoint file (optional — leave blank to scan the full
1–262144 region range) and whether to resume from `leaderboard_checkpoint.txt` if one
exists. Pass `--auto` (or pipe/redirect stdin) to skip both prompts and always do a full,
auto-resuming run — this is what the scheduled workflow uses.
 
A full run currently takes about 2 hours, rate-limited against wplace's API with adaptive
backoff across 20 parallel connection slots.
 
### Automated snapshots
 
`.github/workflows/snapshot.yml` runs the builder every **Saturday at 01:00 UTC** (and can
also be triggered manually from the Actions tab), then commits the new CSV and updated
`manifest.json` back to `Leaderboard_files/`. No server or manual step required to keep the
dashboard current.
 
## Known limitation: data accuracy
 
Because Phase 1 only captures each region's **top 50 painters**, any region that *isn't*
in its country's own top 50 is undercounted — the true total for that region is at least
as high as what's shown, but not exactly known. This means country totals skew low. For
example, the United States shows noticeably fewer pixels here than its actual total.
 
This is a limitation of what wplace's public API exposes per-region, not a bug — the
dashboard's Info tab surfaces this same disclaimer to anyone using it.
 
## Running the dashboard locally
 
It's three static files — open `index.html` in a browser, or serve the folder with any
static file server. No build step, no dependencies to install. It fetches CSVs and the
manifest straight from GitHub, so an internet connection is required even when running it
locally.
 
If you fork this repo, update the repo config constants near the top of `js/data.js`
(`REPO_OWNER`, `REPO_NAME`, `REPO_BRANCH`, `REPO_DIR`) to point at your own fork.


## Credits

- Map tiles: [CARTO](https://carto.com/) · [OpenStreetMap](https://openstreetmap.org/copyright)
- Libraries: [Leaflet](https://leafletjs.com/) · [PapaParse](https://www.papaparse.com/)
- Data: [wplace.live](https://wplace.live)
- Regions json: [PRTSSourceCode](https://github.com/PRTSSourceCode/RegionDump/releases/tag/results)

## License
 
MIT — see [LICENSE](./LICENSE).
