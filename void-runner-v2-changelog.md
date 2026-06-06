# Void Runner v2 Changelog

## Changes
- **Sound engine** — 5 sound effects via Web Audio API (shoot, explosion, powerup, hit, gameover)
- **Mute toggle** — 🔊/🔇 button in top-right corner
- **Power-up timers** — Visual timer bars showing remaining duration for shield, rapid fire, multi-shot
- **Survival time** — Survived duration shown on game over screen (e.g. "2m 15s")
- **Score sharing** — "SHARE SCORE" button copies formatted score text with survival time and high score to clipboard, shows toast confirmation
- **Smoother difficulty** — Difficulty curve changed from score/500 to score/200 for better progression
- **Responsive canvas** — Auto-resizes to window size, max 800x600

## Verification
- All changes QA-tested in browser: clean load, no JS errors
- Sound plays on all triggered events
- Mute toggles correctly
- Power-up timers display during active effects
- Share button copies correct text to clipboard
- Survival time formats correctly
- High score persists via localStorage

## Git
- Commit: `4c3fb60` feat: add sound engine, mute toggle, powerup timers, share score, survival time
