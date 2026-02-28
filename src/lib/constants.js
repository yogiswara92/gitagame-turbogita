/**
 * constants.js – Shared game configuration values
 * Centralised here so tweaking feels is easy.
 */

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;

// Road layout
export const ROAD_LEFT = 80;
export const ROAD_RIGHT = 400;
export const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;  // 320
export const LANE_COUNT = 3;
export const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;  // ~107

// Lane centre X positions
export const LANE_CENTERS = [
    ROAD_LEFT + LANE_WIDTH * 0.5,
    ROAD_LEFT + LANE_WIDTH * 1.5,
    ROAD_LEFT + LANE_WIDTH * 2.5,
];

// Player car
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 72;
export const PLAYER_START_X = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
export const PLAYER_START_Y = CANVAS_HEIGHT - 160;

// Physics – dibuat lebih responsif
export const MAX_SPEED = 14;
export const ACCELERATION = 0.4;   // was 0.18 – lebih cepat nambah gas
export const DECELERATION = 0.25;  // was 0.12
export const FRICTION = 0.06;  // was 0.08
export const STEER_SPEED = 9;     // was 4.5 – gerakan kiri/kanan jauh lebih cepat
export const MIN_SPEED = 0;

// Enemy cars
export const ENEMY_WIDTH = 40;
export const ENEMY_HEIGHT = 68;
export const ENEMY_BASE_SPEED = 4;     // was 3
export const ENEMY_SPAWN_INTERVAL = 1200;   // was 1800ms – lebih cepat spawn
export const ENEMY_SPAWN_INTERVAL_MIN = 500; // was 700ms

// Difficulty ramp – every N seconds speed increases
export const DIFFICULTY_INTERVAL = 20;       // seconds
export const DIFFICULTY_SPEED_INC = 0.8;     // was 0.6

// Road animation
export const STRIPE_HEIGHT = 40;
export const STRIPE_GAP = 40;

// Collision AABB shrink factor (avoids pixel-perfect but feels fair)
export const COLLISION_SHRINK = 8;
