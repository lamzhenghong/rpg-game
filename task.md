# Tasks

- [x] Declare `WORLD_WIDTH` and `WORLD_HEIGHT` constants in `CombatArena.tsx`
- [x] Initialize player position to world center `(1000, 1000)` in `playerRef`
- [x] Calculate camera scroll offsets (`camX`, `camY`) in `updateGameLoop`
- [x] Translate world space drawings by `-camX` and `-camY` in canvas context, and restore for screen space overlays
- [x] Draw background board grid and bounding walls in world space dimensions
- [x] Adjust enemy spawning coordinates and reset player position in `triggerSpawnWave`
- [x] Convert mouse coordinates to world space in `handleCanvasPointerDown` and `handleCanvasPointerMove`
- [x] Update bounds checks in movement and dodge logic
- [x] Verify build and run manual checks
