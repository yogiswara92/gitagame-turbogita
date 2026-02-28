<script>
    /**
     * GameCanvas.svelte – Core game loop and canvas renderer.
     *
     * Responsibilities:
     *  • requestAnimationFrame loop at 60 fps
     *  • Player physics (acceleration, steering, friction)
     *  • Infinite road scrolling
     *  • Enemy car spawning & movement
     *  • AABB collision detection
     *  • Score + difficulty updating
     *  • Keyboard + touch input
     */

    import { onMount, onDestroy } from "svelte";
    import { get } from "svelte/store";
    import { drawPlayerCar } from "./PlayerCar.js";
    import { drawEnemyCar, createEnemy } from "./EnemyCar.js";
    import { SFX } from "../lib/soundEngine.js";
    import {
        gamePhase,
        score,
        survivalTime,
        playerSpeed,
        difficulty,
        playerCarType,
        endGame,
        PHASE,
    } from "../lib/gameStore.js";
    import {
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        ROAD_LEFT,
        ROAD_RIGHT,
        ROAD_WIDTH,
        LANE_COUNT,
        LANE_WIDTH,
        LANE_CENTERS,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
        PLAYER_START_X,
        PLAYER_START_Y,
        MAX_SPEED,
        ACCELERATION,
        DECELERATION,
        FRICTION,
        STEER_SPEED,
        MIN_SPEED,
        ENEMY_WIDTH,
        ENEMY_HEIGHT,
        ENEMY_BASE_SPEED,
        ENEMY_SPAWN_INTERVAL,
        ENEMY_SPAWN_INTERVAL_MIN,
        DIFFICULTY_INTERVAL,
        DIFFICULTY_SPEED_INC,
        STRIPE_HEIGHT,
        STRIPE_GAP,
        COLLISION_SHRINK,
        CAR_SPECS,
    } from "../lib/constants.js";

    // ── Canvas ref ────────────────────────────────────────────
    let canvas;
    let ctx;

    // ── Game state (plain mutable, updated each frame) ────────
    let animId = null;
    let lastTime = 0;
    let running = false; // guard flag – true while game loop is active

    // Dynamic max speed based on selected car
    let currentMaxSpeed = MAX_SPEED;
    let currentAcceleration = ACCELERATION;
    let speedRatio = 1; // ratio of currentMaxSpeed vs default MAX_SPEED

    // Player
    let px = PLAYER_START_X + PLAYER_WIDTH / 2;
    let py = PLAYER_START_Y + PLAYER_HEIGHT / 2;
    let speed = 0;
    let steer = 0;
    let tilt = 0;

    // Road scroll
    let roadOffset = 0;

    // Enemies
    let enemies = [];
    let spawnTimer = 0;
    let spawnInterval = ENEMY_SPAWN_INTERVAL;

    // Scoring
    let elapsedMs = 0;
    let diffLevel = 1;
    let diffTimer = 0;
    let scoreAcc = 0;
    let lastScoreTick = 0;

    // Input
    const keys = {};

    // Touch flags
    let touchLeft = false;
    let touchRight = false;
    let touchUp = false;
    let touchDown = false;

    // Particles
    let particles = [];

    // Crash flash
    let crashFlash = 0;

    // ── Keyboard ─────────────────────────────────────────────
    function onKeyDown(e) {
        keys[e.code] = true;
        if (
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
                e.key,
            )
        ) {
            e.preventDefault();
        }
    }
    function onKeyUp(e) {
        keys[e.code] = false;
    }

    // ── Touch ────────────────────────────────────────────────
    function handleTouchStart(e) {
        for (const t of e.touches) {
            const rx = t.clientX / window.innerWidth;
            const ry = t.clientY / window.innerHeight;
            if (ry < 0.45) {
                touchUp = true;
            } else {
                touchDown = false;
                if (rx < 0.35) touchLeft = true;
                else if (rx > 0.65) touchRight = true;
                else touchDown = true;
            }
        }
    }
    function handleTouchEnd() {
        touchLeft = touchRight = touchUp = touchDown = false;
    }

    // ── Road ─────────────────────────────────────────────────
    function drawRoad() {
        // Off-road grass
        ctx.fillStyle = "#0d1a0d";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Road surface gradient
        const roadGrad = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
        roadGrad.addColorStop(0, "#1c1c28");
        roadGrad.addColorStop(0.5, "#25253a");
        roadGrad.addColorStop(1, "#1c1c28");
        ctx.fillStyle = roadGrad;
        ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

        // Kerb stripes
        drawKerb(ROAD_LEFT - 14, 14);
        drawKerb(ROAD_RIGHT, 14);

        // Lane dividers
        for (let lane = 1; lane < LANE_COUNT; lane++) {
            const lx = ROAD_LEFT + lane * LANE_WIDTH;
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 2;
            ctx.setLineDash([STRIPE_HEIGHT, STRIPE_GAP]);
            ctx.lineDashOffset = -(roadOffset % (STRIPE_HEIGHT + STRIPE_GAP));
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx, CANVAS_HEIGHT);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawKerb(x, w) {
        const stripeH = 20;
        const count = Math.ceil(CANVAS_HEIGHT / stripeH) + 2;
        const offset = roadOffset % (stripeH * 2);
        for (let i = -1; i < count; i++) {
            const yy = i * stripeH - offset;
            ctx.fillStyle = i % 2 === 0 ? "#cc4444" : "#eeeeee";
            ctx.fillRect(x, yy, w, stripeH);
        }
    }

    // ── Scenery ───────────────────────────────────────────────
    function drawScenery() {
        const treeX = [20, 50, CANVAS_WIDTH - 32, CANVAS_WIDTH - 56];
        const spacing = 120;
        const offset = roadOffset % spacing;

        treeX.forEach((tx) => {
            for (let i = -1; i < Math.ceil(CANVAS_HEIGHT / spacing) + 1; i++) {
                drawTree(tx, i * spacing - offset);
            }
        });
    }

    function drawTree(x, y) {
        ctx.fillStyle = "#5c3d2e";
        ctx.fillRect(x - 3, y, 6, 18);
        ctx.fillStyle = "#1e5c1e";
        ctx.shadowColor = "rgba(0,80,0,0.3)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y - 6, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // ── Particles ─────────────────────────────────────────────
    function spawnParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7 - 2,
                life: 1,
                decay: 0.04 + Math.random() * 0.04,
                size: 2 + Math.random() * 5,
                color: Math.random() > 0.5 ? "#ff6b35" : "#ff3860",
            });
        }
    }

    function updateParticles() {
        particles = particles.filter((p) => p.life > 0);
        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= p.decay;
        });
    }

    function drawParticles() {
        particles.forEach((p) => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ── Collision (AABB) ──────────────────────────────────────
    function checkCollisions() {
        const ps = COLLISION_SHRINK;
        const pl = px - PLAYER_WIDTH / 2 + ps;
        const pr = px + PLAYER_WIDTH / 2 - ps;
        const pt = py - PLAYER_HEIGHT / 2 + ps;
        const pb = py + PLAYER_HEIGHT / 2 - ps;

        for (const enemy of enemies) {
            const el = enemy.x - ENEMY_WIDTH / 2 + ps;
            const er = enemy.x + ENEMY_WIDTH / 2 - ps;
            const et = enemy.y - ENEMY_HEIGHT / 2 + ps;
            const eb = enemy.y + ENEMY_HEIGHT / 2 - ps;

            // Near-miss detection: enlarged collision box (touch = crash)
            const nm = 24;
            const nlx = px - PLAYER_WIDTH / 2 - nm;
            const nrx = px + PLAYER_WIDTH / 2 + nm;
            const nty = py - PLAYER_HEIGHT / 2 - nm;
            const nby = py + PLAYER_HEIGHT / 2 + nm;

            if (nlx < er && nrx > el && nty < eb && nby > et) {
                spawnParticles(px, py);
                crashFlash = 1;
                SFX.crash();
                SFX.stopEngine();
                running = false;
                endGame();
                return;
            }
        }
    }

    // ── Enemy spawning ────────────────────────────────────────
    function spawnEnemy(dt) {
        spawnTimer += dt;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            
            // Count enemies in each lane to balance spawning
            const laneEnemyCounts = [0, 0, 0];
            enemies.forEach((e) => {
                for (let i = 0; i < LANE_COUNT; i++) {
                    const dist = Math.abs(e.x - LANE_CENTERS[i]);
                    if (dist < LANE_WIDTH / 2) {
                        laneEnemyCounts[i]++;
                        break;
                    }
                }
            });
            
            // Find lane(s) with fewest enemies
            const minCount = Math.min(...laneEnemyCounts);
            const leastBusyLanes = [];
            for (let i = 0; i < LANE_COUNT; i++) {
                if (laneEnemyCounts[i] === minCount) {
                    leastBusyLanes.push(i);
                }
            }
            
            // Pick one of the least busy lanes (ensures all lanes get enemies)
            const laneIdx = leastBusyLanes[Math.floor(Math.random() * leastBusyLanes.length)];
            
            const ex = LANE_CENTERS[laneIdx];
            // Scale enemy speed based on player car's speedRatio
            const eSpeed =
                (ENEMY_BASE_SPEED +
                diffLevel * DIFFICULTY_SPEED_INC +
                speed * 0.4) * speedRatio;
            enemies.push(createEnemy(ex, -ENEMY_HEIGHT / 2, eSpeed));

            // Scale spawn interval based on speedRatio (slower car = slower spawn rate)
            spawnInterval = Math.max(
                ENEMY_SPAWN_INTERVAL_MIN / speedRatio,
                (ENEMY_SPAWN_INTERVAL - (diffLevel - 1) * 140) / speedRatio,
            );
        }
    }

    // ── Player physics ────────────────────────────────────────
    function updatePlayer(dt) {
        const dtF = dt / 16.667; // normalise to ~60 fps

        const accelKey = keys["ArrowUp"] || touchUp;
        const brakeKey = keys["ArrowDown"] || touchDown;
        const leftKey = keys["ArrowLeft"] || touchLeft;
        const rightKey = keys["ArrowRight"] || touchRight;

        // Speed
        if (accelKey) {
            speed = Math.min(speed + currentAcceleration * dtF, currentMaxSpeed);
        } else if (brakeKey) {
            speed = Math.max(speed - DECELERATION * dtF * 1.5, 0);
        } else {
            speed = Math.max(speed - FRICTION * dtF, 0);
        }

        // Steer – flat base speed so left/right always feel snappy
        // Scaling by speed is removed; only a small bonus at high speed
        if (leftKey) steer = -1;
        else if (rightKey) steer = 1;
        else steer = 0;

        const steerPx = steer * STEER_SPEED * dtF; // fixed per-frame amount
        px = Math.max(
            ROAD_LEFT + PLAYER_WIDTH / 2,
            Math.min(ROAD_RIGHT - PLAYER_WIDTH / 2, px + steerPx),
        );

        // Visual lean
        tilt += (steer * 0.35 - tilt) * 0.2;

        playerSpeed.set(speed);
    }

    // ── Score & difficulty ────────────────────────────────────
    function updateScore(dt) {
        elapsedMs += dt;
        diffTimer += dt;

        // Scale difficulty timing based on speedRatio (slower car = longer time to level up)
        if (diffTimer >= (DIFFICULTY_INTERVAL * 1000) / speedRatio) {
            diffTimer = 0;
            diffLevel++;
            difficulty.set(diffLevel);
            SFX.beep(true);
        }

        if (elapsedMs - lastScoreTick >= 200) {
            lastScoreTick = elapsedMs;
            const speedBonus = Math.round((speed / currentMaxSpeed) * 8);
            scoreAcc += 2 + speedBonus;
            score.set(scoreAcc);
        }

        survivalTime.set(elapsedMs / 1000);
    }

    // ── Speed lines ───────────────────────────────────────────
    function drawSpeedLines() {
        const t = (speed / MAX_SPEED - 0.6) / 0.4;
        ctx.save();
        ctx.globalAlpha = t * 0.22;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
            const lx = ROAD_LEFT + Math.random() * ROAD_WIDTH;
            const len = 22 + Math.random() * 44;
            const ly = Math.random() * CANVAS_HEIGHT;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + (Math.random() - 0.5) * 4, ly + len);
            ctx.stroke();
        }
        ctx.restore();
    }

    // ── Main game loop ────────────────────────────────────────
    function gameLoop(ts) {
        // Double-check we're still supposed to be running
        if (!running) return;

        const dt = Math.min(ts - lastTime, 50);
        lastTime = ts;

        // Update
        updatePlayer(dt);
        updateScore(dt);
        spawnEnemy(dt);

        roadOffset += speed * 1.3;

        // Move enemies
        enemies.forEach((e) => {
            e.y += e.speed + speed * 0.55;
            e.wobbleTimer += dt;
            if (e.wobbleTimer > 1200) {
                e.wobbleTimer = 0;
                e.wobbleDir *= -1;
            }
            e.x += e.wobbleDir * 0.25 * (dt / 16.667);
            e.x = Math.max(
                ROAD_LEFT + ENEMY_WIDTH / 2,
                Math.min(ROAD_RIGHT - ENEMY_WIDTH / 2, e.x),
            );
        });
        enemies = enemies.filter(
            (e) => e.y < CANVAS_HEIGHT + ENEMY_HEIGHT + 20,
        );

        SFX.engine(speed / currentMaxSpeed);
        checkCollisions();
        updateParticles();

        // Draw
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawScenery();
        drawRoad();
        enemies.forEach((e) => drawEnemyCar(ctx, e));
        drawPlayerCar(ctx, px, py, tilt, speed / currentMaxSpeed, get(playerCarType));
        drawParticles();

        if (crashFlash > 0) {
            ctx.fillStyle = `rgba(255,50,50,${crashFlash * 0.6})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            crashFlash -= 0.09;
        }

        // Speed lines animation disabled
        // if (speed > currentMaxSpeed * 0.6) drawSpeedLines();

        animId = requestAnimationFrame(gameLoop);
    }

    // ── Start / Stop helpers ──────────────────────────────────
    function startLoop() {
        // Set car-specific stats
        const carType = get(playerCarType);
        const carSpecs = CAR_SPECS[carType];
        currentMaxSpeed = carSpecs.maxSpeed;
        currentAcceleration = carSpecs.acceleration;
        speedRatio = currentMaxSpeed / MAX_SPEED; // ratio for scaling difficulty
        
        // Set audio characteristics for this car type
        SFX.setCarType(carType);

        // Reset all game state
        px = PLAYER_START_X + PLAYER_WIDTH / 2;
        py = PLAYER_START_Y + PLAYER_HEIGHT / 2;
        speed = 0;
        steer = 0;
        tilt = 0;
        roadOffset = 0;
        enemies = [];
        spawnTimer = 0;
        spawnInterval = ENEMY_SPAWN_INTERVAL;
        elapsedMs = 0;
        diffLevel = 1;
        diffTimer = 0;
        scoreAcc = 0;
        lastScoreTick = 0;
        particles = [];
        crashFlash = 0;
        Object.keys(keys).forEach((k) => delete keys[k]);

        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        running = true;
        lastTime = performance.now();
        animId = requestAnimationFrame(gameLoop);
    }

    function stopLoop() {
        running = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    // ── Subscribe to gamePhase store directly ─────────────────
    // This is more reliable than the $: prop pattern in Svelte 5
    const unsubPhase = gamePhase.subscribe((phase) => {
        if (!ctx) return; // canvas not ready yet – handled in onMount
        if (phase === PHASE.PLAYING) {
            startLoop();
        } else {
            stopLoop();
        }
    });

    // ── Lifecycle ─────────────────────────────────────────────
    onMount(() => {
        ctx = canvas.getContext("2d");
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        // Draw idle frame (road visible on start screen)
        drawScenery();
        drawRoad();
        drawPlayerCar(ctx, px, py, 0, 0, get(playerCarType));

        // If game is already PLAYING when component mounts, start immediately
        if (get(gamePhase) === PHASE.PLAYING) {
            startLoop();
        }
    });

    onDestroy(() => {
        stopLoop();
        unsubPhase();
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
    });
</script>

<!-- Touch overlay (full canvas, passive tracking) -->
<div
    class="touch-zone"
    on:touchstart|preventDefault={handleTouchStart}
    on:touchend|preventDefault={handleTouchEnd}
    on:touchcancel|preventDefault={handleTouchEnd}
    aria-hidden="true"
></div>

<canvas
    bind:this={canvas}
    width={CANVAS_WIDTH}
    height={CANVAS_HEIGHT}
    id="game-canvas"
    aria-label="TurboRush game canvas"
></canvas>

<!-- Mobile touch buttons (visible on coarse-pointer / touch devices) -->
<div class="touch-controls" aria-label="Touch controls">
    <!-- Left side: steering controls -->
    <div class="control-group left-controls">
        <button
            class="touch-btn"
            id="touch-left"
            on:touchstart|preventDefault={() => (touchLeft = true)}
            on:touchend|preventDefault={() => (touchLeft = false)}
            aria-label="Left">◀</button
        >
        <button
            class="touch-btn"
            id="touch-right"
            on:touchstart|preventDefault={() => (touchRight = true)}
            on:touchend|preventDefault={() => (touchRight = false)}
            aria-label="Right">▶</button
        >
    </div>
    
    <!-- Right side: gas and brake -->
    <div class="control-group right-controls">
        <button
            class="touch-btn large"
            id="touch-accel"
            on:touchstart|preventDefault={() => (touchUp = true)}
            on:touchend|preventDefault={() => (touchUp = false)}
            aria-label="Accelerate">▲</button
        >
        <button
            class="touch-btn small"
            id="touch-brake"
            on:touchstart|preventDefault={() => (touchDown = true)}
            on:touchend|preventDefault={() => (touchDown = false)}
            aria-label="Brake">▼</button
        >
    </div>
</div>

<style>
    canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: crisp-edges;
        border-radius: 12px 12px 0 0;
        position: relative;
        z-index: 1;
    }

    .touch-zone {
        position: absolute;
        inset: 0;
        z-index: 0;
    }

    .touch-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 8px 12px 12px;
        display: none; /* shown via media query below */
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        z-index: 20;
    }

    @media (pointer: coarse) {
        .touch-controls {
            display: flex;
        }
    }

    .control-group {
        display: flex;
        gap: 10px;
        align-items: flex-end;
    }

    .left-controls {
        flex-direction: row;
    }

    .right-controls {
        flex-direction: column;
        align-items: center;
    }

    .touch-row {
        display: flex;
        gap: 8px;
    }

    .touch-btn {
        width: 56px;
        height: 56px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.85);
        font-size: 20px;
        font-weight: bold;
        backdrop-filter: blur(6px);
        transition:
            background 0.15s,
            border-color 0.15s,
            transform 0.1s;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        active-scale: 0.92;
    }

    .touch-btn:active {
        background: rgba(0, 245, 160, 0.3);
        border-color: var(--color-primary);
        transform: scale(0.92);
    }

    .touch-btn.large {
        width: 76px;
        height: 76px;
        font-size: 28px;
    }

    .touch-btn.small {
        width: 48px;
        height: 48px;
        font-size: 18px;
    }
</style>
