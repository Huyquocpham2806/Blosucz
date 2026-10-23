# Reference audit — 2026-10-22

Selected scope: `reference15`, reference timing where measured. Existing custom
levels are preserved in git history; no second production level mode is added.

Baseline: `40770f1085b383177f1687301f4e4cfae4ff305a` (GitHub Init), clean checkout.
The earlier local starter at `9fd81fe` has identical Source content. Baseline:
100 non-E2E passed, 90 solver skips; 22 Chromium E2E passed. Python 3.12.14,
Playwright 1.56.0 / Chromium headless shell 141.0.7390.37, Linux software WebGL.
One existing Starlette/httpx deprecation warning. No AGENTS.md found.

## Primary build

- Game credited to Damien Clarke / DX Interactive.
- Distribution: https://bloxorz.org/play/bloxorz.swf, downloaded 2026-10-22.
- SHA-256: `b9f58fee0c22f4cb7bf6b6d78c9042902204c41820748a4e3861a3c60281148c`.
- SWF 8, 36 frames/second, 99 root timeline frames.
- Data audit: JPEXS Free Flash Decompiler 26.4.0; exported scripts are temporary
  reference material outside this repo, not application code or assets.
- Stage data: root frame 15 (`levels` ordering and associated data arrays).
- Projection: root frame 47: screen x = 32 c + 10 r + offset;
  screen y = -5 c + 16 r + offset. Therefore a generic symmetric isometric
  camera and a forced near-start/far-goal layout are not this build's projection.
- Initial bridges: l/r off; k/q on (root frame 47).
- Whole block: sprite 1152; small cube: sprite 829. Input handlers live under
  root frame 50. Small-cube switch activation is checked only for the moving
  cube; an unmoved cube does not repeatedly press a switch.
- Merge runs a separate whole-block landing check (sprite 1152 frames 290/310),
  after the moving small cube's landing check. This can activate soft switches
  again. SWAP changes selection without incrementing the original move counter.
- Split: sprite 1152 frame 282 selects the first destination before normalization.

## Supporting sources

https://www.coolmathgames.com/0-bloxorz documents general controls and mechanics.
Its text alone is not used to certify tile positions or timing.
The independent transcription at
https://github.com/tkoz0/bloxorz-solver/blob/master/coolmath.json is a cross-check
only. No solver code from that repository is imported. Primary SWF data wins
if the transcription differs (including passcodes).

## Scope limits

Only stages 1–15. Generated procedural assets, solver UI, undo, metrics, action
count including SWAP, and unit/risk costs are academic extensions. Original
assets and the SWF are not shipped. Exact pixels/audio and Flash's intermediate
frame collision quirks are not claimed. Timing and rendered fidelity are reported
separately from discrete layout/rule verification in FIDELITY.md.

## Runtime observation and captures

The same SWF was run locally with Ruffle (npm distribution fetched 2026-10-22),
Chromium 141 software WebGL, locale en-US, 900×600 viewport. Stage 01, passcode
780464, zero moves, after intro: [reference screenshot](screenshots/reference_stage01.png).
It confirms the asymmetric lattice, grey stone, rusty block, orange/red-to-black
background and square hole. This screenshot is QA evidence only, never loaded by
web/. App screenshots use 1440×900 desktop and 390×844 mobile; extra effect captures
use 1280×720. Projection is validated numerically against the actual camera,
not a stretched screenshot. Full 15-stage layout verification comes from primary
stage arrays rather than guessing occluded tiles from one screenshot.

Timeline evidence: sprite 1152 roll frames 2–10 (~9 frames), end/sink 259–267
(8 intervals), split 270–282 (12 intervals), at 36 fps. These provide nominal
frame durations, with at least one-frame sampling ambiguity (27.8 ms), not measured
wall-clock medians. Original terminal timing varies with fall branch and looping
frame handlers. Repeated wall-clock measurements of the original were not completed;
those timing claims remain unverified, explicitly separated in FIDELITY.md.
