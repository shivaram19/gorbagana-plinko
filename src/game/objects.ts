import { HEIGHT, NUM_SINKS, WIDTH, obstacleRadius, sinkWidth } from "./constants";
import { pad } from "./padding";

export interface Obstacle {
    x: number;
    y: number;
    radius: number;
}

export interface Sink {
    x: number;
    y: number;
    width: number;
    height: number;
    multiplier?: number;
}

// GORBAGANA-PLINKO MULTIPLIERS (adapted from original plinkoo pattern)
const MULTIPLIERS: {[ key: number ]: number} = {
    1: 8,    // Edge slots (high)
    2: 3,    // Near edge
    3: 2,    // Mid-high
    4: 1.5,  // Mid
    5: 1.2,  // Low-mid
    6: 1.1,  // Low
    7: 1,    // Lowest
    8: 5,    // Center high
    9: 1,    // Lowest
    10: 1.1, // Low
    11: 1.2, // Low-mid
    12: 1.5, // Mid
    13: 2,   // Mid-high
    14: 3,   // Near edge
    15: 8    // Edge slots (high)
}

// ORIGINAL PLINKOO OBSTACLE CREATION - Exact replica with improved spacing
export const createObstacles = (): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const rows = 18; // Original plinkoo rows
    
    for (let row = 2; row < rows; row++) {
        const numObstacles = row + 1;
        const y = 0 + row * 35; // Original plinkoo spacing
        const spacing = 36; // Original plinkoo spacing - consistent with sink spacing
        
        for (let col = 0; col < numObstacles; col++) {
            const x = WIDTH / 2 - spacing * (row / 2 - col);
            obstacles.push({
                x: pad(x), 
                y: pad(y), 
                radius: obstacleRadius 
            });
        }   
    }
    
    console.log(`🎯 Created ${obstacles.length} obstacles using original plinkoo layout`);
    return obstacles;
}

// ADAPTED SINK CREATION for gorbagana-plinko (15 slots instead of 17)
export const createSinks = (): Sink[] => {
    const sinks = [];
    
    // FIXED: Center-based positioning for accurate collision detection
    // Each sink center should align with peg columns
    const pegSpacing = 36; // Same as obstacle spacing
    const totalSinksWidth = (NUM_SINKS - 1) * pegSpacing;
    const startX = (WIDTH - totalSinksWidth) / 2;
    
    for (let i = 0; i < NUM_SINKS; i++) {
        // FIXED: Store left edge position, collision will calculate center
        const centerX = startX + (i * pegSpacing);
        const x = centerX - sinkWidth / 2; // Left edge position
        const y = HEIGHT - 170; // Original plinkoo Y position
        const width = sinkWidth; // Now 48px for better coverage
        const height = width;
        
        sinks.push({ 
            x, // Left edge position for rendering
            y, 
            width, 
            height, 
            multiplier: MULTIPLIERS[i+1] 
        });
    }

    console.log(`🎯 Created ${sinks.length} sinks with center-based positioning`);
    console.log(`   - Sink width: ${sinkWidth}px`);
    console.log(`   - Peg spacing: ${pegSpacing}px`);
    return sinks;
}
