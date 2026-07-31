# Airport Control

A small browser-based air traffic control game built with plain HTML, CSS, and Canvas.

## Gameplay

Click an aircraft, or click near one, to assign the nearest aircraft to the runway. A red curved guide is the aircraft's actual flight path: the plane moves along that path, then enters the approach fix, threshold, touchdown point, and runway exit. Click another point while the aircraft is selected to bend that curve through the clicked point.

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
