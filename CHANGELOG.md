# Changelog

## 2026-07-31

- Added the browser-based Airport Control MVP.
- Added GitHub Pages deployment through GitHub Actions.
- Added one-way runway landing rules.
- Added selected-aircraft curved landing guidance to the approach fix, threshold, touchdown point, and runway exit.
- Increased aircraft pick radius so selecting a moving aircraft is less fiddly.
- Changed selected-aircraft guidance from a visual-only curve to sampled curved flight waypoints.
- Added click-to-bend curve control for selected aircraft.
- Added a visible runway landing zone and direction arrows.
- Increased aircraft pick radius again and made selected aircraft visually stronger.
- Made first aircraft selection more forgiving while keeping curve-bend clicks usable after selection.
- Expanded first-selection tolerance so players can reliably start controlling a moving aircraft.
- Added a click fallback for aircraft selection when pointer events are not delivered.
- Added a mousedown fallback with shared input debouncing for browser compatibility.
- Changed first click with no selected aircraft to pick the nearest aircraft.
- Recorded the rule that every development change must keep `README.md` and `CHANGELOG.md` updated.
