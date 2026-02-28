/**
 * EnemyCar.js – Renders AI enemy cars onto the canvas.
 * Each car has a random colour variant.
 */

import { ENEMY_WIDTH, ENEMY_HEIGHT } from '../lib/constants.js';

// Predefined colour palettes for variety
const PALETTES = [
    { body: ['#ff6b35', '#cc4a1a', '#8a2a00'], glass: 'rgba(200,220,255,0.7)' },
    { body: ['#845ef7', '#5c3db5', '#2e1a7d'], glass: 'rgba(220,200,255,0.7)' },
    { body: ['#ff4466', '#cc1133', '#880022'], glass: 'rgba(255,210,210,0.7)' },
    { body: ['#f9ca24', '#cc9a00', '#886400'], glass: 'rgba(255,245,200,0.7)' },
    { body: ['#00b4d8', '#0077a0', '#003d5c'], glass: 'rgba(200,240,255,0.7)' },
];

/**
 * Create a new enemy car state object
 * @param {number} x
 * @param {number} y
 * @param {number} speed
 * @returns {Object}
 */
export function createEnemy(x, y, speed) {
    return {
        x,
        y,
        speed,
        paletteIdx: Math.floor(Math.random() * PALETTES.length),
        wobble: 0,  // slight lateral drift
        wobbleDir: Math.random() > 0.5 ? 1 : -1,
        wobbleTimer: 0,
    };
}

/**
 * Draw a single enemy car
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} car  – enemy car state
 */
export function drawEnemyCar(ctx, car) {
    const palette = PALETTES[car.paletteIdx];
    const x = car.x;
    const y = car.y;
    const w = ENEMY_WIDTH;
    const h = ENEMY_HEIGHT;
    const hw = w / 2;
    const hh = h / 2;

    ctx.save();
    ctx.translate(x, y);

    // ── Shadow ──
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;

    // ── Body ──
    const bodyGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    bodyGrad.addColorStop(0, palette.body[0]);
    bodyGrad.addColorStop(0.5, palette.body[1]);
    bodyGrad.addColorStop(1, palette.body[2]);
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, -hw, -hh, w, h, 7);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    // ── Window (front, enemy faces down so window is at bottom) ──
    ctx.fillStyle = palette.glass;
    roundRect(ctx, -hw, hh * 0.15, w, h * 0.22, 3);
    ctx.fill();

    // ── Headlights (pointing down – enemy drives toward player) ──
    ctx.fillStyle = '#ffffcc';
    ctx.shadowColor = 'rgba(255,255,200,0.9)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(-hw * 0.52, hh - 7, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hw * 0.52, hh - 7, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Tail lights (at top of enemy car) ──
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = 'rgba(255,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(-hw * 0.52, -hh + 7, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hw * 0.52, -hh + 7, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Wheels ──
    drawWheel(ctx, -hw - 2, -hh * 0.45, 7, 14);
    drawWheel(ctx, hw + 2, -hh * 0.45, 7, 14);
    drawWheel(ctx, -hw - 2, hh * 0.45, 7, 14);
    drawWheel(ctx, hw + 2, hh * 0.45, 7, 14);

    ctx.restore();
}

function drawWheel(ctx, x, y, rw, rh) {
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    roundRect(ctx, x - rw / 2, y - rh / 2, rw, rh, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x, y, rw * 0.4, 0, Math.PI * 2);
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
