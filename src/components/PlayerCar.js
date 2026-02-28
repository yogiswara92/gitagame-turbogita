/**
 * PlayerCar.js – Renders the player's car onto the canvas.
 * Pure drawing functions; no Svelte component (called from GameCanvas).
 */

import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../lib/constants.js';
import { CAR_TYPES } from '../lib/gameStore.js';

// Car color definitions for each type
const CAR_COLORS = {
    green: {
        body: ['#00f5a0', '#00d68a', '#007a50'],
        accent: '#00ff99',
    },
    pink: {
        body: ['#ff69b4', '#ff1493', '#c71585'],
        accent: '#ffb6d9',
    },
    yellow: {
        body: ['#ffd700', '#ffb700', '#cc9500'],
        accent: '#ffff99',
    },
};

/**
 * Draw the player's car at (x, y) with given tilt (radians).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x   – centre X
 * @param {number} y   – centre Y
 * @param {number} tilt – steering tilt in radians
 * @param {number} speedRatio – 0-1, for exhaust effect
 * @param {string} carType – 'green', 'pink', or 'yellow'
 */
export function drawPlayerCar(ctx, x, y, tilt, speedRatio, carType = CAR_TYPES.GREEN) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt * 0.08); // small visual lean

    const w = PLAYER_WIDTH;
    const h = PLAYER_HEIGHT;
    const hw = w / 2;
    const hh = h / 2;

    // Get colors for this car type
    const colors = CAR_COLORS[carType] || CAR_COLORS.green;

    // ── Exhaust flames (behind car) ──
    if (speedRatio > 0.15) {
        const flameLen = speedRatio * 22 + Math.random() * 8;
        const grad = ctx.createLinearGradient(0, hh, 0, hh + flameLen);
        grad.addColorStop(0, 'rgba(255,150,0,0.9)');
        grad.addColorStop(0.4, 'rgba(255,80,0,0.6)');
        grad.addColorStop(1, 'rgba(255,50,0,0)');
        ctx.fillStyle = grad;

        // Left exhaust
        ctx.beginPath();
        ctx.ellipse(-hw * 0.3, hh + flameLen * 0.5, 4, flameLen * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right exhaust
        ctx.beginPath();
        ctx.ellipse(hw * 0.3, hh + flameLen * 0.5, 4, flameLen * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── Car body shadow ──
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    // ── Car body ──
    const bodyGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    bodyGrad.addColorStop(0, colors.body[0]);
    bodyGrad.addColorStop(0.4, colors.body[1]);
    bodyGrad.addColorStop(1, colors.body[2]);
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, -hw, -hh, w, h, 8);
    ctx.fill();

    // ── Windows ──
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const winGrad = ctx.createLinearGradient(-hw * 0.45, -hh * 0.35, hw * 0.45, -hh * 0.05);
    winGrad.addColorStop(0, 'rgba(180,230,255,0.85)');
    winGrad.addColorStop(1, 'rgba(100,180,255,0.4)');
    ctx.fillStyle = winGrad;
    roundRect(ctx, -hw, -hh * 0.35, w, h * 0.22, 3);
    ctx.fill();

    // ── Windshield glare ──
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(-hw * 0.2, -hh * 0.38, 6, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // ── Headlights ──
    ctx.fillStyle = '#ffffcc';
    ctx.shadowColor = 'rgba(255,255,200,0.8)';
    ctx.shadowBlur = 12;
    // Left
    ctx.beginPath();
    ctx.ellipse(-hw * 0.52, -hh + 7, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right
    ctx.beginPath();
    ctx.ellipse(hw * 0.52, -hh + 7, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Tail lights ──
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = 'rgba(255,0,0,0.6)';
    ctx.shadowBlur = 8;
    // Left
    ctx.beginPath();
    ctx.ellipse(-hw * 0.52, hh - 7, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right
    ctx.beginPath();
    ctx.ellipse(hw * 0.52, hh - 7, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Wheels ──
    drawWheel(ctx, -hw - 2, -hh * 0.45, 7, 14);
    drawWheel(ctx, hw + 2, -hh * 0.45, 7, 14);
    drawWheel(ctx, -hw - 2, hh * 0.45, 7, 14);
    drawWheel(ctx, hw + 2, hh * 0.45, 7, 14);

    // ── Centre stripe ──
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -hh + 10);
    ctx.lineTo(0, hh - 10);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawWheel(ctx, x, y, rw, rh) {
    ctx.fillStyle = '#1a1a2e';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    roundRect(ctx, x - rw / 2, y - rh / 2, rw, rh, 3);
    ctx.fill();
    ctx.stroke();
    // Rim highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(x, y, rw * 0.4, 0, Math.PI * 2);
    ctx.stroke();
}

/** Polyfill for ctx.roundRect that works everywhere */
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
