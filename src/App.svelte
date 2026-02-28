<script>
  /**
   * App.svelte – Root component.
   * Manages overall game phase and assembles all sub-components.
   * GameCanvas now drives itself by subscribing to gamePhase store.
   */
  import GameCanvas from "./components/GameCanvas.svelte";
  import HUD from "./components/HUD.svelte";
  import StartScreen from "./components/StartScreen.svelte";
  import GameOver from "./components/GameOver.svelte";
  import { gamePhase, startGame, resetGame, PHASE } from "./lib/gameStore.js";

  function handleStart() {
    startGame();
  }
  function handleRestart() {
    resetGame();
    startGame();
  }
  function handleHome() {
    resetGame();
    gamePhase.set(PHASE.START);
  }

  // Scale viewport to fit any screen
  function calcScale() {
    const el = document.getElementById("game-viewport");
    if (!el) return;
    const sx = (window.innerWidth - 24) / 480;
    const sy = (window.innerHeight - 24) / 720;
    const s = Math.min(sx, sy, 1.4);
    el.style.transform = `scale(${s})`;
  }
</script>

<svelte:window on:resize={calcScale} />

<svelte:head>
  <title>TurboGita – 2D Racing Game</title>
</svelte:head>

<main class="game-shell" id="game-shell" aria-label="TurboGita Game">
  <div class="game-viewport" id="game-viewport">
    <!-- Canvas always mounted so the store subscription is active -->
    <GameCanvas />

    <!-- HUD overlay during gameplay & game-over -->
    {#if $gamePhase !== PHASE.START}
      <HUD />
    {/if}

    <!-- Screens -->
    {#if $gamePhase === PHASE.START}
      <StartScreen onStart={handleStart} />
    {/if}

    {#if $gamePhase === PHASE.GAMEOVER}
      <GameOver onRestart={handleRestart} onHome={handleHome} />
    {/if}
  </div>
</main>

<svelte:body on:load={calcScale} />

<style>
  .game-shell {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at center, #0d1520 0%, #060608 100%);
    overflow: hidden;
  }

  .game-viewport {
    position: relative;
    width: 480px;
    height: 720px;
    overflow: hidden;
    border-radius: 16px;
    transform-origin: center center;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 0 60px rgba(0, 245, 160, 0.12),
      0 40px 80px rgba(0, 0, 0, 0.8);
  }
</style>
