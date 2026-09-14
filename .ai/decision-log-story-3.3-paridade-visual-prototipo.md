# Decision Log - Story 3.3

Date: 2026-09-10
Mode: YOLO
Orchestrator: @aiox-master (Orion)
Story: `docs/stories/story-3.3-paridade-visual-prototipo.md`

## Decisions

1. Use the existing component tree in `src/` as the behavioral source of truth.
   Reason: the requested change is visual parity and the story explicitly preserves hooks, storage, domain behavior and callbacks.

2. Keep the compact console shell from the reference at desktop and mobile sizes.
   Reason: the reference uses a narrow, vertically stacked control surface; responsiveness is handled by reflow and bounded max-width, not zoom.

3. Add semantic nuclear-console tokens instead of moving the reference monolith into the application.
   Reason: repeated surface, LCD, texture, shadow, status and focus values need one source of truth while preserving the existing component boundaries.

4. Update shared primitives before screen-specific logic.
   Reason: `Plate`, `Label`, `Lcd`, `Lamp`, `Support` and `MetricBadge` feed the requested screens and reduce visual drift without changing state contracts.

5. Treat visual QA as a handoff gate rather than claiming it from unit tests.
   Reason: automated tests verify tokens, labels, states and accessibility contracts; screenshot-level visual approval remains the responsibility of UX/QA.

## Verification

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test -- --run`: PASS, 12 files and 130 tests
- `npm run build`: PASS
- Dev server smoke test: PASS, `http://127.0.0.1:5173/` returned HTTP 200
