# Airport Control

A small browser-based air traffic control game built with plain HTML, CSS, and Canvas.

## Gameplay

Click or touch an aircraft, or tap near one, to select it. Once selected, hold and drag anywhere on the radar to draw that aircraft's red route. Click or tap another aircraft to switch selection, then draw its route. The aircraft follows the exact drawn route. Touch controls are calibrated for mobile screens with high precision scaling and pointer capture.

The green block on the runway marks the landing zone. Aircraft must enter from the `APPROACH` side and line up with the runway heading before crossing that zone.

## Play locally

Open `index.html` in a browser, or run:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

Push to `main`. The GitHub Actions workflow at `.github/workflows/pages.yml` deploys the static files to GitHub Pages.

No build step is needed.

## Product Roadmap & Progress

For detailed Senior PO analysis and design specifications, see [roadmap.md](file:///c:/Users/ethan/Downloads/airport_control/roadmap.md).

### Progress Tracker
- [ ] **Phase 1: Stage-Based Progression System** (Stage 1-5, Stage Clear screen, Stage Objectives)
- [ ] **Phase 2: Cozy Visual Refresh & Regional Airport Background** (Cute plane designs, cozy countryside aesthetic)
- [ ] **Phase 3: Aircraft Fleet Profiling & Variable Dynamics** (Small Propeller, Regional Jet, Heavy Cargo, Helicopter)
- [ ] **Phase 4: Color-Coded Matching & Colorblind Accessibility** (Sunburst, Teal, Coral, Emerald Helipad + symbol matching)
- [ ] **Phase 5: Web Audio API Procedural Sound System** (Engine hum, radio chimes, landing fanfare, warning blips)
- [ ] **Phase 6: Active Items, Skills & Weather Hazards** (Freeze Time, Speed Boost, Emergency Reroute, Wind Hazards)

## Development Rules

- Every development change must update `README.md` when behavior, controls, setup, or deployment changes.
- Every development change must update `CHANGELOG.md`.
- GitHub Actions CI workflow enforces that code changes also update `README.md` and `CHANGELOG.md`.
