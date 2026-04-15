# First Game 2.0

A 2D platformer built with Godot Engine — one of my earliest programming projects and the one that made me realize I could actually build things from scratch.

## Overview

First Game 2.0 is a side-scrolling platformer where the player runs, jumps, wall-jumps, and shoots fireballs to defeat enemies while collecting coins across a level. The goal is to collect all 7 coins to reach the win screen, while avoiding enemy damage and falling off the map.

It is a small, single-level game. The point was never to ship a polished product — it was to understand how game systems actually connect to each other.

## Why This Project Mattered

Before this, programming felt abstract. This was the first time I connected code directly to something I could see and interact with: a character that moved when I pressed a key, enemies that responded to being hit, a score that updated on screen.

That feedback loop — write code, see it work — is what made development click for me. This project is where my interest in building software seriously started.

## What I Learned

- **State machines** — the player uses four distinct states (`AIR`, `FLOOR`, `WALL`, `LADDER`) managed with a `match` block. Learning to think about behavior in terms of discrete states made a lot of later programming problems easier to reason about.
- **Physics and velocity** — applying gravity every frame, using `lerp` for smooth acceleration and deceleration, clamping wall-slide speed. These were my first hands-on lessons in how game physics actually work under the hood.
- **Signals and loose coupling** — coins emit a `coin_collected` signal that the HUD listens to, without either node knowing about the other directly. This was my first real exposure to event-driven design.
- **Scene instancing** — spawning fireballs at runtime, positioning them relative to the player, and passing direction data to the new instance. Small thing, but it was the first time I understood that objects can create other objects.
- **Collision layers** — using different collision layer bits to distinguish the player, enemies, and projectiles, so fireballs could destroy enemies without also destroying the player.
- **Iterating on a working system** — this is 2.0. The first version was messier. Revisiting it, cleaning up the code, and adding features (wall jumping, cliff-aware enemies, run mechanic) taught me more than building it the first time did.

## Features

- Walk, run, jump, and wall-jump
- Fireball projectile that travels in the facing direction, bounces off floors, and destroys enemies on contact
- Wall-slide: the player drifts slowly down when pressed against a wall
- Two enemy variants: basic patrol (reverses on walls) and cliff-aware patrol (purple tint, turns before walking off ledges)
- Stomp enemies from above to squish them; taking a side hit triggers a knockback and death timer
- Coin collection with a bounce animation and sound effect on pickup
- HUD coin counter — collect all 7 coins to trigger the win screen
- Fall zones trigger an instant game over
- Title menu, game over screen, and win screen with navigation buttons
- Sound effects for jumping, landing hits, collecting coins, shooting fireballs, and squashing enemies

## Tech Stack

- [Godot Engine 3.x](https://godotengine.org/) — game engine and editor
- GDScript — all game logic

## Running the Game

1. Download and install [Godot Engine 3.x](https://godotengine.org/download)
2. Open Godot and click **Import**
3. Navigate to the `First Game 2.0` folder and select `project.godot`
4. Click **Import & Edit**, then press **F5** (or the Play button) to run

## Controls

| Action | Key |
|---|---|
| Move left / right | Arrow keys or A / D |
| Jump | Space or Up arrow |
| Run | Hold Shift |
| Shoot fireball | Z or configured fire key |

> Controls are mapped in Godot's Input Map. If the defaults don't match your setup, they can be remapped in **Project → Project Settings → Input Map**.

## Limitations

- Single level — there is no level progression beyond the one included
- No save system or persistent score
- The win condition is hardcoded to exactly 7 coins in `HUD.gd`
- Enemy AI is simple: patrol, reverse on wall or cliff, no pathfinding
- No mobile or gamepad support

## If I Were to Continue It

- Add a second level and a proper level-select or progression screen
- Replace the hardcoded coin count with a per-level configuration
- Add a health system instead of one-hit death
- Give enemies more varied behavior
- Add background music

## Author

**Jack Gerber**
- Portfolio: [jgerbs.github.io/Portfolio](https://jgerbs.github.io/Portfolio/)
- GitHub: [github.com/jgerbs](https://github.com/jgerbs)
- LinkedIn: [linkedin.com/in/jack-gerber-4840ab1b1](https://www.linkedin.com/in/jack-gerber-4840ab1b1/)
