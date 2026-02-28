/**
 * gameStore.js – Svelte rune-based reactive game state.
 * All game logic that needs to be shared across components lives here.
 */

import { writable, derived } from 'svelte/store';

// ── Game Phases ──────────────────────────────────────────────
export const PHASE = {
    START: 'start',
    PLAYING: 'playing',
    GAMEOVER: 'gameover',
};

// ── Car Types ────────────────────────────────────────────────
export const CAR_TYPES = {
    GREEN: 'green',   // Racing car
    PINK: 'pink',     // Hatchback
    YELLOW: 'yellow', // Taxi
};

// ── Stores ───────────────────────────────────────────────────

/** Current game phase */
export const gamePhase = writable(PHASE.START);

/** Selected player car type */
export const playerCarType = writable(CAR_TYPES.GREEN);

/** Elapsed survival time in seconds */
export const survivalTime = writable(0);

/** Current score (derived from time + near-misses) */
export const score = writable(0);

/** High score persisted across sessions */
const storedHigh = parseInt(localStorage.getItem('turboRush_highScore') || '0', 10);
export const highScore = writable(storedHigh);

/** Current player speed (0–MAX_SPEED) */
export const playerSpeed = writable(0);

/** Difficulty level (increases over time) */
export const difficulty = writable(1);

// Keep high score synced in localStorage
score.subscribe(s => {
    highScore.update(h => {
        const newH = Math.max(h, s);
        localStorage.setItem('turboRush_highScore', String(newH));
        return newH;
    });
});

// ── Helpers ──────────────────────────────────────────────────

export function resetGame() {
    survivalTime.set(0);
    score.set(0);
    playerSpeed.set(0);
    difficulty.set(1);
}

export function startGame() {
    resetGame();
    gamePhase.set(PHASE.PLAYING);
}

export function endGame() {
    gamePhase.set(PHASE.GAMEOVER);
}
