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
export const MAX_SPEED = 12;
export const ACCELERATION = 0.3;   // was 0.4 – lebih smooth
export const DECELERATION = 0.2;  // was 0.25
export const FRICTION = 0.05;  // was 0.06
export const STEER_SPEED = 7;     // was 9 – steering lebih smooth
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

// Car specifications
export const CAR_SPECS = {
    green: {
        name: 'Green Saber',
        maxSpeed: 12,  // 300 km/h display
        displaySpeed: 300,
        acceleration: 0.3,
        description: 'Racing Car'
    },
    pink: {
        name: 'Pink Spark',
        maxSpeed: 8.8,  // 220 km/h display
        displaySpeed: 220,
        acceleration: 0.25,
        description: 'Hatchback'
    },
    yellow: {
        name: 'Public Taxi',
        maxSpeed: 6,  // 150 km/h display
        displaySpeed: 150,
        acceleration: 0.2,
        description: 'Taxi'
    }
};
