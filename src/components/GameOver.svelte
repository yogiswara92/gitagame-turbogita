<script>
    /**
     * GameOver.svelte – Game Over modal overlay.
     * Shows final score, high score, survival time, and restart button.
     */
    import {
        score,
        highScore,
        survivalTime,
    } from "../lib/gameStore.js";
    import { SFX } from "../lib/soundEngine.js";

    export let onRestart;
    export let onHome;

    function handleRestart() {
        SFX.beep(true);
        onRestart();
    }

    function handleHome() {
        SFX.beep(true);
        onHome();
    }

    function handleKeydown(e) {
        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            handleRestart();
        }
    }

    function formatTime(s) {
        const m = Math.floor(s / 60)
            .toString()
            .padStart(2, "0");
        const sec = Math.floor(s % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${sec}`;
    }

    $: isHighScore = $score > 0 && $score >= $highScore;
</script>

<svelte:window on:keydown={handleKeydown} />

<div
    class="overlay"
    aria-modal="true"
    role="dialog"
    aria-labelledby="gameover-title"
    id="gameover-overlay"
>
    <div class="modal" id="gameover-modal">
        <!-- Crash animation -->
        <div class="crash-icon" aria-hidden="true">💥</div>

        <h2 class="title" id="gameover-title">GAME OVER</h2>

        {#if isHighScore}
            <div class="new-record" aria-live="polite">🏆 NEW HIGH SCORE!</div>
        {/if}

        <!-- Stats grid -->
        <div class="stats-grid">
            <div class="stat-item" id="final-score">
                <span class="stat-label">FINAL SCORE</span>
                <span class="stat-value primary">{$score.toLocaleString()}</span
                >
            </div>
            <div class="stat-item" id="final-best">
                <span class="stat-label">BEST</span>
                <span class="stat-value gold"
                    >{$highScore.toLocaleString()}</span
                >
            </div>
            <div class="stat-item" id="final-time">
                <span class="stat-label">TIME</span>
                <span class="stat-value">{formatTime($survivalTime)}</span>
            </div>
        </div>

        <!-- Buttons -->
        <div class="btn-row">
            <button
                class="restart-btn"
                id="restart-button"
                on:click={handleRestart}
                aria-label="Restart game"
            >
                <span>🔄 RESTART</span>
                <small>SPACE / ENTER</small>
            </button>
            <button
                class="home-btn"
                id="home-button"
                on:click={handleHome}
                aria-label="Back to home"
            >
                <span>🏠 HOME</span>
            </button>
        </div>
    </div>
</div>

<style>
    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 40;
        animation: fadeIn 0.3s ease;
        border-radius: 12px;
    }

    .modal {
        background: linear-gradient(145deg, #12121f, #1a1a2e);
        border: 1px solid rgba(255, 56, 96, 0.3);
        border-radius: var(--radius-xl);
        padding: 32px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        width: 300px;
        max-width: 90%;
        box-shadow:
            0 0 60px rgba(255, 56, 96, 0.25),
            0 30px 60px rgba(0, 0, 0, 0.6);
        animation: fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .crash-icon {
        font-size: 52px;
        filter: drop-shadow(0 0 16px rgba(255, 100, 0, 0.8));
        animation: shake 0.4s ease;
    }

    @keyframes shake {
        0%,
        100% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(-8deg) scale(1.1);
        }
        75% {
            transform: rotate(8deg) scale(1.1);
        }
    }

    .title {
        font-family: var(--font-game);
        font-size: 28px;
        font-weight: 900;
        color: var(--color-danger);
        text-shadow: 0 0 20px rgba(255, 56, 96, 0.6);
        letter-spacing: 3px;
        margin: 0;
    }

    .new-record {
        font-family: var(--font-game);
        font-size: 13px;
        color: #f9ca24;
        text-shadow: 0 0 12px rgba(249, 202, 36, 0.6);
        letter-spacing: 1.5px;
        animation: pulse 1s ease-in-out infinite;
        background: rgba(249, 202, 36, 0.08);
        border: 1px solid rgba(249, 202, 36, 0.25);
        border-radius: 20px;
        padding: 5px 14px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
    }

    .stat-item {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: var(--radius-md);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: center;
    }

    .stat-label {
        font-size: 9px;
        letter-spacing: 2px;
        color: rgba(255, 255, 255, 0.35);
        font-family: var(--font-game);
    }

    .stat-value {
        font-size: 22px;
        font-weight: 700;
        font-family: var(--font-game);
        color: #fff;
    }

    .stat-value.primary {
        color: var(--color-primary);
        text-shadow: 0 0 12px rgba(0, 245, 160, 0.5);
    }
    .stat-value.gold {
        color: #f9ca24;
        text-shadow: 0 0 10px rgba(249, 202, 36, 0.5);
    }

    .btn-row {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .restart-btn {
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #ff3860, #cc1133);
        border-radius: var(--radius-md);
        color: #fff;
        font-family: var(--font-game);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        box-shadow:
            0 0 24px rgba(255, 56, 96, 0.4),
            0 8px 20px rgba(0, 0, 0, 0.4);
        transition:
            transform 0.15s,
            box-shadow 0.15s;
        cursor: pointer;
    }

    .restart-btn:hover {
        transform: translateY(-2px);
        box-shadow:
            0 0 36px rgba(255, 56, 96, 0.6),
            0 12px 28px rgba(0, 0, 0, 0.5);
    }

    .restart-btn:active {
        transform: translateY(1px);
    }

    .restart-btn small {
        font-size: 9px;
        opacity: 0.5;
        letter-spacing: 2px;
        font-family: var(--font-ui);
        font-weight: 400;
    }

    .home-btn {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, rgba(0, 245, 160, 0.2), rgba(0, 200, 160, 0.1));
        border: 1px solid rgba(0, 245, 160, 0.3);
        border-radius: var(--radius-md);
        color: var(--color-primary);
        font-family: var(--font-game);
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        transition:
            transform 0.15s,
            box-shadow 0.15s,
            background 0.15s;
        cursor: pointer;
    }

    .home-btn:hover {
        transform: translateY(-2px);
        background: linear-gradient(135deg, rgba(0, 245, 160, 0.3), rgba(0, 200, 160, 0.2));
        box-shadow: 0 0 20px rgba(0, 245, 160, 0.3);
    }

    .home-btn:active {
        transform: translateY(1px);
    }
</style>
