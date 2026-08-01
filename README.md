# Airport Control — Cozy Regional Air Traffic Game

[![CI Check](https://github.com/ethanpark0726/airport_control/actions/workflows/ci.yml/badge.svg)](https://github.com/ethanpark0726/airport_control/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/ethanpark0726/airport_control/actions/workflows/pages.yml/badge.svg)](https://github.com/ethanpark0726/airport_control/actions/workflows/pages.yml)
![Tech Stack](https://img.shields.io/badge/Tech-HTML5%20Canvas%20%7C%20JS-58ffd1?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-06d6a0?style=flat-square)
![Version](https://img.shields.io/badge/Version-v2.1.0-9d4edd?style=flat-square)

A warm, picturesque browser-based air traffic control game set in a cozy regional airfield, built with plain HTML5, CSS, and Canvas.

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
- [x] **Phase 1: Stage-Based Progression System** (Stage 1–50+ scaling, Stage Clear screen, Milestone Rushes)
- [x] **Phase 2: Cozy Visual Refresh & Regional Airport Background** (Cute plane designs, cozy countryside aesthetic)
- [ ] **Phase 3: Aircraft Fleet Profiling & Variable Dynamics** (Small Propeller, Regional Jet, Heavy Cargo, Helicopter)
- [ ] **Phase 4: Color-Coded Matching & Colorblind Accessibility** (Sunburst, Teal, Coral, Emerald Helipad + symbol matching)
- [ ] **Phase 5: Web Audio API Procedural Sound System** (Engine hum, radio chimes, landing fanfare, warning blips)
- [ ] **Phase 6: Active Items, Skills & Weather Hazards** (Freeze Time, Speed Boost, Emergency Reroute, Wind Hazards)

## Development Rules

- Every development change must update `README.md` and bump the Version badge (`vX.Y.Z`).
- Every development change must update `CHANGELOG.md`.
- **Mandatory Versioning & Documentation Rule**: Every feature branch commit/merge MUST bump the Version badge in `README.md` and update `CHANGELOG.md`.
- GitHub Actions CI workflow enforces that code changes also update `README.md` (including version badge) and `CHANGELOG.md`.
