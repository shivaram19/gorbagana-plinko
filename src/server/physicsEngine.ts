import type { BallPath, PhysicsConfig } from '../types/game';

export class PhysicsEngine {
  private config: PhysicsConfig = {
    gravity: 0.5,
    bounce: 0.7,
    friction: 0.99,
    pegRadius: 4,
    ballRadius: 12,
    boardWidth: 800,
    boardHeight: 384
  };

  generateBallPath(randomSeed: string): { path: BallPath[], winningSlot: number } {
    // Seed the random number generator (simplified)
    const seed = this.hashCode(randomSeed);
    let random = this.seededRandom(seed);

    const path: BallPath[] = [];
    let x = this.config.boardWidth / 2; // Start at center
    let y = 20; // Start near top
    let vx = (random() - 0.5) * 2; // Small initial horizontal velocity
    let vy = 0;
    
    const startTime = Date.now();
    let time = 0;

    // Simulate ball physics
    while (y < this.config.boardHeight - 50 && time < 5000) {
      // Apply gravity
      vy += this.config.gravity;
      
      // Update position
      x += vx;
      y += vy;
      
      // Check collisions with pegs
      const pegCollision = this.checkPegCollisions(x, y);
      if (pegCollision) {
        // Bounce off peg
        const angle = random() * Math.PI * 2;
        vx = Math.cos(angle) * 3;
        vy = Math.sin(angle) * 2;
      }
      
      // Apply friction
      vx *= this.config.friction;
      vy *= this.config.friction;
      
      // Boundary checks
      if (x < this.config.ballRadius) {
        x = this.config.ballRadius;
        vx = Math.abs(vx);
      }
      if (x > this.config.boardWidth - this.config.ballRadius) {
        x = this.config.boardWidth - this.config.ballRadius;
        vx = -Math.abs(vx);
      }
      
      // Record position every few ms for smooth animation
      if (time % 16 === 0) { // ~60 FPS
        path.push({
          x: Math.round(x),
          y: Math.round(y),
          timestamp: startTime + time
        });
      }
      
      time += 16;
    }

    // Determine winning slot based on final x position
    const slotWidth = this.config.boardWidth / 15;
    const winningSlot = Math.max(1, Math.min(15, Math.floor(x / slotWidth) + 1));

    return { path, winningSlot };
  }

  private checkPegCollisions(ballX: number, ballY: number): boolean {
    // Simplified peg collision detection
    // In a real implementation, you'd check against actual peg positions
    const pegSpacing = 50;
    const rows = 12;
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 4;
      const rowY = 50 + row * 25;
      
      if (Math.abs(ballY - rowY) < this.config.ballRadius + this.config.pegRadius) {
        for (let col = 0; col < pegsInRow; col++) {
          const pegX = 400 + (col - row / 2 - 1.5) * pegSpacing;
          const distance = Math.sqrt(
            Math.pow(ballX - pegX, 2) + Math.pow(ballY - rowY, 2)
          );
          
          if (distance < this.config.ballRadius + this.config.pegRadius) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number) {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    
    return function() {
      seed = (a * seed + c) % m;
      return seed / (m - 1);
    };
  }
}