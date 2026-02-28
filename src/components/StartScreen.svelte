<script>
    /**
     * StartScreen.svelte – Animated title screen shown before gameplay.
     * Includes keyboard hint, high score display, and a pulsing Cars visual.
     */
    import { highScore, playerCarType, CAR_TYPES } from "../lib/gameStore.js";
    import { CAR_SPECS } from "../lib/constants.js";
    import { SFX } from "../lib/soundEngine.js";

    export let onStart;

    function handleStart() {
        SFX.beep(true);
        onStart();
    }

    function selectCar(carType) {
        playerCarType.set(carType);
        SFX.beep(false);
    }

    // Keyboard shortcut
    function handleKeydown(e) {
        if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            handleStart();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="start-screen" id="start-screen" aria-label="Start Screen">
    <!-- Animated background grid lines -->
    <div class="grid-bg" aria-hidden="true"></div>

    <!-- Racing stripe decoration -->
    <div class="stripe-left" aria-hidden="true"></div>
    <div class="stripe-right" aria-hidden="true"></div>

    <!-- Logo -->
    <div class="logo-wrap">
        <div class="logo-subtitle">🏁 WELCOME TO</div>
        <h1 class="logo" id="game-title">
            <span class="logo-t">TURBO</span><span class="logo-r">GITA</span>
        </h1>
        <div class="logo-tagline">Survive. Accelerate. Dominate.</div>
    </div>

    <!-- Mini car preview -->
    <div class="car-preview" aria-hidden="true">
        <div class="car-preview-road">
            <div class="car-icon player-car-icon">🚗</div>
            <div class="car-icon player-car-icon">🚕</div>
            <div class="car-icon player-car-icon">🚙</div>
        </div>
    </div>

    <!-- Car selection -->
    <div class="car-selection">
        <div class="selection-label">CHOOSE YOUR CAR</div>
        <div class="car-options">
            <button
                class="car-option {$playerCarType === CAR_TYPES.GREEN ? 'active' : ''}"
                on:click={() => selectCar(CAR_TYPES.GREEN)}
                aria-label="Green Racing Car"
            >
                <div class="car-color green"></div>
                <div class="car-label">Green Saber</div>
                <div class="car-speed">300 km/h</div>
            </button>
            <button
                class="car-option {$playerCarType === CAR_TYPES.PINK ? 'active' : ''}"
                on:click={() => selectCar(CAR_TYPES.PINK)}
                aria-label="Pink Hatchback"
            >
                <div class="car-color pink"></div>
                <div class="car-label">Pink Spark</div>
                <div class="car-speed">220 km/h</div>
            </button>
            <button
                class="car-option {$playerCarType === CAR_TYPES.YELLOW ? 'active' : ''}"
                on:click={() => selectCar(CAR_TYPES.YELLOW)}
                aria-label="Yellow Taxi"
            >
                <div class="car-color yellow"></div>
                <div class="car-label">Public Taxi</div>
                <div class="car-speed">150 km/h</div>
            </button>
        </div>
    </div>

    <!-- Controls guide -->
    <!-- <div class="controls-guide">
        <div class="guide-row">
            <div class="key-group">
                <div class="key wide" aria-label="Arrow Up key">↑</div>
                <div class="key-row">
                    <div class="key" aria-label="Arrow Left key">←</div>
                    <div class="key" aria-label="Arrow Down key">↓</div>
                    <div class="key" aria-label="Arrow Right key">→</div>
                </div>
            </div>
            <div class="guide-text">
                <span>Arrow Keys</span>
                <small>or touch buttons on mobile</small>
            </div>
        </div>
    </div> -->

    <!-- High score -->
    {#if $highScore > 0}
        <div class="best-score" id="start-best-score">
            <span class="bs-label">🏆 BEST SCORE</span>
            <span class="bs-value">{$highScore.toLocaleString()}</span>
        </div>
    {/if}

    <!-- Start button -->
    <button
        class="start-btn"
        id="start-button"
        on:click={handleStart}
        aria-label="Start Game"
    >
        <span class="btn-text">START RACE</span>
        <span class="btn-hint">SPACE / ENTER</span>
    </button>

    <div class="footer-note">
        Avoid enemies • Speed increases every 20 seconds
    </div>
</div>

<style>
    .start-screen {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        background: linear-gradient(
            160deg,
            #0a0a1a 0%,
            #0d1a14 50%,
            #0a0a1a 100%
        );
        border-radius: 12px;
        overflow: hidden;
        animation: fadeIn 0.5s ease;
        z-index: 30;
    }

    /* Grid bg */
    .grid-bg {
        position: absolute;
        inset: 0;
        display: none;
    }

    @keyframes pan {
        from {
            background-position: 0 0;
        }
        to {
            background-position: 36px 36px;
        }
    }

    .stripe-left,
    .stripe-right {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 6px;
        background: repeating-linear-gradient(
            180deg,
            #cc4444 0px,
            #cc4444 24px,
            #eeeeee 24px,
            #eeeeee 48px
        );
        opacity: 0.5;
        animation: scroll-stripe 0.8s linear infinite;
    }
    .stripe-left {
        left: 18px;
    }
    .stripe-right {
        right: 18px;
    }

    @keyframes scroll-stripe {
        from {
            background-position: 0 0;
        }
        to {
            background-position: 0 48px;
        }
    }

    /* Logo */
    .logo-wrap {
        text-align: center;
        z-index: 1;
        animation: slideDown 0.6s ease;
    }

    .logo-subtitle {
        font-family: var(--font-ui);
        font-size: 11px;
        letter-spacing: 4px;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 6px;
        text-transform: uppercase;
    }

    .logo {
        font-family: var(--font-game);
        font-size: clamp(42px, 10vw, 64px);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -1px;
        margin: 0;
    }

    .logo-t {
        color: #ffffff;
        text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
    }

    .logo-r {
        color: var(--color-primary);
        text-shadow:
            0 0 30px rgba(0, 245, 160, 0.6),
            0 0 60px rgba(0, 245, 160, 0.3);
    }

    .logo-tagline {
        font-family: var(--font-ui);
        font-size: 12px;
        color: rgba(255, 255, 255, 0.35);
        margin-top: 6px;
        letter-spacing: 2px;
    }

    /* Car preview */
    .car-preview {
        z-index: 1;
        width: 200px;
    }

    .car-preview-road {
        background: #1c1c28;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 20px;
        position: relative;
        overflow: hidden;
    }

    .car-icon {
        font-size: 26px;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
        padding: 6px 8px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .car-icon.green-car {
        background: linear-gradient(135deg, rgba(0, 245, 160, 0.3), rgba(0, 122, 80, 0.3));
        border: 2px solid #00f5a0;
    }

    .car-icon.pink-car {
        background: linear-gradient(135deg, rgba(255, 105, 180, 0.3), rgba(199, 21, 133, 0.3));
        border: 2px solid #ff69b4;
    }

    .car-icon.yellow-car {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(204, 149, 0, 0.3));
        border: 2px solid #ffd700;
    }

    .player-car-icon {
        animation: bounce 0.8s ease-in-out infinite alternate;
    }

    .player-car-icon:nth-child(1) {
        animation-delay: 0s;
    }

    .player-car-icon:nth-child(2) {
        animation-delay: 0.2s;
    }

    .player-car-icon:nth-child(3) {
        animation-delay: 0.4s;
    }

    .enemy-icon {
        animation: drift 1.5s ease-in-out infinite alternate;
    }

    .e1 {
        animation-delay: 0s;
    }
    .e2 {
        animation-delay: 0.5s;
    }

    @keyframes bounce {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-4px);
        }
    }

    @keyframes drift {
        from {
            transform: translateX(-4px);
        }
        to {
            transform: translateX(4px);
        }
    }

    /* Car selection */
    .car-selection {
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .selection-label {
        font-family: var(--font-game);
        font-size: 11px;
        letter-spacing: 3px;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
    }

    .car-options {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .car-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.04);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        cursor: pointer;
        transition:
            all 0.2s ease,
            transform 0.15s;
    }

    .car-option:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .car-option.active {
        border-color: var(--color-primary);
        background: rgba(0, 245, 160, 0.1);
        box-shadow: 0 0 20px rgba(0, 245, 160, 0.3);
    }

    .car-color {
        width: 40px;
        height: 32px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .car-color.green {
        background: linear-gradient(135deg, #00f5a0, #007a50);
    }

    .car-color.pink {
        background: linear-gradient(135deg, #ff69b4, #c71585);
    }

    .car-color.yellow {
        background: linear-gradient(135deg, #ffd700, #cc9500);
    }

    .car-label {
        font-family: var(--font-ui);
        font-size: 10px;
        letter-spacing: 1px;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
    }

    .car-speed {
        font-family: var(--font-game);
        font-size: 9px;
        letter-spacing: 1px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 2px;
    }

    .car-option.active .car-label {
        color: var(--color-primary);
        font-weight: 600;
    }

    .car-option.active .car-speed {
        color: rgba(0, 245, 160, 0.7);
        font-weight: 600;
    }
    .controls-guide {
        z-index: 1;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: var(--radius-md);
        padding: 12px 20px;
    }

    .guide-row {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .key-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .key-row {
        display: flex;
        gap: 4px;
    }

    .key {
        width: 32px;
        height: 30px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: var(--color-primary);
        box-shadow: 0 3px 0 rgba(0, 0, 0, 0.4);
    }

    .key.wide {
        width: 32px;
    }

    .guide-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-family: var(--font-ui);
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
    }

    .guide-text small {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.3);
    }

    /* Best score */
    .best-score {
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(249, 202, 36, 0.08);
        border: 1px solid rgba(249, 202, 36, 0.2);
        border-radius: 20px;
        padding: 6px 16px;
        animation: glow-pulse 2s ease-in-out infinite;
    }

    .bs-label {
        font-size: 11px;
        letter-spacing: 2px;
        color: rgba(249, 202, 36, 0.6);
        font-family: var(--font-game);
    }

    .bs-value {
        font-size: 18px;
        font-weight: 700;
        font-family: var(--font-game);
        color: #f9ca24;
        text-shadow: 0 0 10px rgba(249, 202, 36, 0.5);
    }

    /* Start button */
    .start-btn {
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 16px 44px;
        background: linear-gradient(135deg, #00f5a0, #00c97a);
        border-radius: 14px;
        color: #0a1a12;
        font-weight: 700;
        letter-spacing: 2px;
        box-shadow:
            var(--glow-primary),
            0 8px 24px rgba(0, 0, 0, 0.4);
        transition:
            transform 0.15s,
            box-shadow 0.15s;
        animation: glow-pulse 2.5s ease-in-out infinite;
        cursor: pointer;
    }

    .start-btn:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow:
            0 0 40px rgba(0, 245, 160, 0.7),
            0 12px 32px rgba(0, 0, 0, 0.5);
    }

    .start-btn:active {
        transform: translateY(1px) scale(0.98);
    }

    .btn-text {
        font-size: 16px;
        font-family: var(--font-game);
    }

    .btn-hint {
        font-size: 9px;
        letter-spacing: 2px;
        opacity: 0.5;
        font-family: var(--font-ui);
    }

    .footer-note {
        z-index: 1;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.2);
        letter-spacing: 0.5px;
        font-family: var(--font-ui);
        text-align: center;
        padding: 0 20px;
    }
</style>
