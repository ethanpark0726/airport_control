# Airport Control

A small browser-based air traffic control game built with plain HTML, CSS, and Canvas.

## Gameplay

Click an aircraft to assign it to the runway. A curved yellow guide shows the one-way approach path: approach fix, threshold, touchdown, and runway exit. Aircraft must line up with the runway heading from the approach side to land.

Manual vectoring still works: after selecting an aircraft, click another point on the radar to give it a direct heading target.

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
