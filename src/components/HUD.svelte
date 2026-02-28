<script>
  /**
   * HUD.svelte – Heads-Up Display overlay
   * Shows: speedometer arc, score, survival time, difficulty badge
   */
  import {
    score,
    survivalTime,
    playerSpeed,
    difficulty,
    highScore,
    resetGame,
    gamePhase,
    PHASE,
  } from "../lib/gameStore.js";
  import { MAX_SPEED } from "../lib/constants.js";
  import { SFX } from "../lib/soundEngine.js";

  function handleHome() {
    SFX.beep(true);
    resetGame();
  }

  // Format seconds as mm:ss
  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  }

  // Speedometer arc path (SVG)
  function speedArcPath(ratio) {
    const R = 36;
    const cx = 44,
      cy = 44;
    const startAngle = Math.PI * 0.75; // 135°
    const endAngle = startAngle + Math.PI * 1.5 * ratio; // sweep 270° max
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const large = ratio > 2 / 3 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  }

  $: speedRatio = Math.min($playerSpeed / MAX_SPEED, 1);
  $: speedKmh = Math.round(speedRatio * 260);
  $: arcPath = speedArcPath(speedRatio);

  // Colour lerp based on speed
  $: needleColor =
    speedRatio < 0.5
      ? `hsl(${140 - speedRatio * 80}, 100%, 55%)` // green → yellow
      : `hsl(${60 - (speedRatio - 0.5) * 120}, 100%, 55%)`; // yellow → red
</script>

<div class="hud" id="hud-overlay" aria-label="Game HUD">
  <!-- ── Top bar ────────────────────────── -->
  <div class="top-bar">
    <div class="stat-block" id="hud-score">
      <span class="label">SCORE</span>
      <span class="value score-val">{$score.toLocaleString()}</span>
    </div>

    <div class="stat-block center" id="hud-time">
      <span class="label">TIME</span>
      <span class="value">{formatTime($survivalTime)}</span>
    </div>

    <div class="stat-block right" id="hud-highscore">
      <span class="label">BEST</span>
      <span class="value hi">{$highScore.toLocaleString()}</span>
    </div>

    <button
      class="home-btn"
      id="hud-home-btn"
      on:click={handleHome}
      aria-label="Back to home"
      title="Return to home screen"
    >
      🏠
    </button>
  </div>

  <!-- ── Difficulty badge ──────────────── -->
  <div class="diff-badge" id="hud-difficulty" class:danger={$difficulty >= 4}>
    LVL {$difficulty}
  </div>

  <!-- ── Speedometer (bottom-left) ─────── -->
  <div class="speedo" id="hud-speedometer" aria-label="Speedometer">
    <svg width="88" height="88" viewBox="0 0 88 88">
      <!-- Track -->
      <path
        d="M 18.7 69.3 A 36 36 0 1 1 69.3 69.3"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="6"
        stroke-linecap="round"
      />
      <!-- Active arc -->
      {#if speedRatio > 0.01}
        <path
          d={arcPath}
          fill="none"
          stroke={needleColor}
          stroke-width="6"
          stroke-linecap="round"
          filter="url(#glow)"
        />
      {/if}
      <!-- Glow filter -->
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <!-- Centre dot -->
      <circle cx="44" cy="44" r="3" fill={needleColor} opacity="0.8" />
    </svg>
    <div class="speedo-text">
      <span class="kmh" style:color={needleColor}>{speedKmh}</span>
      <span class="unit">km/h</span>
    </div>
  </div>
</div>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
    font-family: var(--font-game);
  }

  /* ── Top bar ── */
  .top-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 16px 0;
    position: relative;
  }

  .stat-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-block.center {
    align-items: center;
  }
  .stat-block.right {
    align-items: flex-end;
  }

  .home-btn {
    pointer-events: all;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.15s;
    backdrop-filter: blur(6px);
  }

  .home-btn:hover {
    background: rgba(0, 245, 160, 0.12);
    border-color: rgba(0, 245, 160, 0.3);
    transform: scale(1.05);
  }

  .home-btn:active {
    transform: scale(0.95);
  }

  .label {
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
  }

  .value {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
    line-height: 1;
  }

  .value.score-val {
    color: var(--color-primary);
    text-shadow: 0 0 14px rgba(0, 245, 160, 0.5);
  }
  .value.hi {
    color: #f9ca24;
    text-shadow: 0 0 12px rgba(249, 202, 36, 0.5);
  }

  /* ── Difficulty badge ── */
  .diff-badge {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 52px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(6px);
    transition:
      color 0.4s,
      border-color 0.4s;
  }

  .diff-badge.danger {
    color: var(--color-danger);
    border-color: rgba(255, 56, 96, 0.4);
    text-shadow: 0 0 8px rgba(255, 56, 96, 0.6);
  }

  /* ── Speedometer ── */
  .speedo {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 88px;
    height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .speedo svg {
    position: absolute;
    top: 0;
    left: 0;
  }

  .speedo-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    z-index: 1;
    margin-top: 6px;
  }

  .kmh {
    font-size: 18px;
    font-weight: 900;
    transition: color 0.3s;
  }

  .unit {
    font-size: 7px;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 2px;
  }
</style>
