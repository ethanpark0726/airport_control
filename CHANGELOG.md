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
- Fixed curve guidance so aircraft positions move directly along the red route instead of merely steering toward route points.
- Replaced click-to-bend control with freehand mouse-drawn routes that aircraft follow directly.
- Added automatic runway approach appending when a drawn route ends near the `APPROACH` marker.
- Disabled default canvas touch gestures so drag drawing works on touch devices.
- Changed runway auto-append so routes ending near the landing zone continue forward instead of backtracking to `APPROACH`.
- Expanded the runway auto-append snap range to make landing less fiddly.
- Fixed post-drag click fallback overwriting freshly drawn flight routes.
- Changed drawing so an already-selected aircraft keeps selection while the player draws anywhere on the radar.
- Restored switching to another aircraft by clicking near it while one is already selected.
- Fixed aircraft selection bug where `state.selected` was not cleared after an aircraft landed, preventing subsequent aircraft from being selected.
- Removed automatic straight-line runway approach appending (`points.threshold`, `points.touchdown`, `points.exit`), so aircraft strictly follow only the exact path drawn by the player.
- Streamlined pointer event handling (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) and removed redundant mouse and click listeners.
- Calibrated mobile touch input by adding DPR/bounding rect scaling, removing initial touch-offset jumps, enabling `setPointerCapture`, and setting `viewport-fit` meta properties.
- Recorded the rule that every development change must keep `README.md` and `CHANGELOG.md` updated.
- Added GitHub Actions CI check workflow (`ci.yml`) to enforce that code changes also update `README.md` and `CHANGELOG.md`.
- Added Senior PO Product Roadmap (`roadmap.md`) defining 6 phases (Stages, Cozy Art, Aircraft Profiles, Color-Coded Runways, Audio Synthesizer, Active Skills).
- Updated `README.md` with Roadmap progress tracker checkboxes.
- Standardized git workflow to use `feature/*` branches merged into `main`.
- Implemented Phase 1 Stage Progression System (`getStageConfig(stage)`), supporting 50+ procedurally scaled stages, stage clear overlays, ⭐⭐⭐ star ratings, and milestone rush hours.
- Implemented Phase 2 Cozy Visual Refresh (`drawCozyEnvironment()`, `drawCutePlane()`, detailed asphalt runway, terminal tarmac, spinning windmill, windsock, and soft drifting clouds).
- Updated `README.md` header with Shields.io status, version (v2.0.0), license, and tech stack badges.
