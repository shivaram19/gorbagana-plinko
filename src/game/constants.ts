import { pad } from "./padding";

// ORIGINAL PLINKOO CONSTANTS - Exact replica
export const WIDTH = 800;
export const HEIGHT = 800;
export const ballRadius = 7;
export const obstacleRadius = 4;

// ORIGINAL PLINKOO PHYSICS - Exact values that work perfectly
export const gravity = pad(0.6);
export const horizontalFriction = 0.4;
export const verticalFriction = 0.8;

export const sinkWidth = 48; // Increased width for better visual alignment
export const NUM_SINKS = 15; // Adapted for gorbagana-plinko (was 17 in original)
