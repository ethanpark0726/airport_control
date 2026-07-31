# Airport Control

A small browser-based air traffic control game built with plain HTML, CSS, and Canvas.

## Gameplay

Click an aircraft, or click near one, to select it. Once selected, hold and drag anywhere on the radar to draw that aircraft's red route. Click another aircraft to switch selection, then draw its route. The aircraft follows the exact drawn route.

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

## Development Rules

- Every development change must update `README.md` when behavior, controls, setup, or deployment changes.
- Every development change must update `CHANGELOG.md`.
- GitHub Actions CI workflow enforces that code changes also update `README.md` and `CHANGELOG.md`.
