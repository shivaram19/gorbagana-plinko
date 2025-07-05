import { HEIGHT, WIDTH, ballRadius, obstacleRadius, sinkWidth } from "../constants";
import { Obstacle, Sink, createObstacles, createSinks } from "../objects";
import { pad, unpad } from "../padding";
import { Ball } from "./Ball";

// ORIGINAL PLINKOO BALL MANAGER - Exact replica with gorbagana adaptations
export class BallManager {
    private balls: Ball[];
    private canvasRef: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private obstacles: Obstacle[]
    private sinks: Sink[]
    private requestId?: number;
    private onFinish?: (index: number, startX?: number) => void;

    constructor(canvasRef: HTMLCanvasElement, onFinish?: (index: number, startX?: number) => void) {
        this.balls = [];
        this.canvasRef = canvasRef;
        this.ctx = this.canvasRef.getContext("2d")!;
        this.obstacles = createObstacles();
        this.sinks = createSinks();
        this.update();
        this.onFinish = onFinish;
        
        console.log(`🎯 BallManager initialized with original plinkoo logic`);
        console.log(`   - ${this.obstacles.length} obstacles`);
        console.log(`   - ${this.sinks.length} sinks`);
    }

    // ORIGINAL PLINKOO BALL ADDITION - Exact replica
    addBall(startX?: number) {
        const newBall = new Ball(
            startX || pad(WIDTH / 2 + 13), // Original plinkoo starting position
            pad(50), // Original plinkoo starting Y
            ballRadius, 
            'red', // Original plinkoo ball color
            this.ctx, 
            this.obstacles, 
            this.sinks, 
            (index) => {
                console.log(`🎯 Ball landed in sink ${index} (original plinkoo logic)`);
                this.balls = this.balls.filter(ball => ball !== newBall);
                this.onFinish?.(index, startX);
            }
        );
        this.balls.push(newBall);
    }

    // ORIGINAL PLINKOO OBSTACLE DRAWING - Exact replica
    drawObstacles() {
        this.ctx.fillStyle = 'white';
        this.obstacles.forEach((obstacle) => {
            this.ctx.beginPath();
            this.ctx.arc(unpad(obstacle.x), unpad(obstacle.y), obstacle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        });
    }

    // ORIGINAL PLINKOO COLOR SYSTEM - Exact replica
    getColor(index: number) {
        if (index < 3 || index > this.sinks.length - 3) {
            return {background: '#ff003f', color: 'white'};
        }
        if (index < 6 || index > this.sinks.length - 6) {
            return {background: '#ff7f00', color: 'white'};
        }
        if (index < 9 || index > this.sinks.length - 9) {
            return {background: '#ffbf00', color: 'black'};
        }
        if (index < 12 || index > this.sinks.length - 12) {
            return {background: '#ffff00', color: 'black'};
        }
        if (index < 15 || index > this.sinks.length - 15) {
            return {background: '#bfff00', color: 'black'};
        }
        return {background: '#7fff00', color: 'black'};
    }

    // ORIGINAL PLINKOO SINK DRAWING - Fixed for center-based positioning
    drawSinks() {
        this.ctx.fillStyle = 'green';
        const SPACING = 4; // Reduced spacing for better visual alignment
        
        for (let i = 0; i < this.sinks.length; i++) {
            this.ctx.fillStyle = this.getColor(i).background;
            const sink = this.sinks[i];
            this.ctx.font = 'bold 14px Arial'; // Slightly larger font
            
            // FIXED: Draw from center position to match collision detection
            const sinkCenterX = sink.x + sink.width / 2;
            this.ctx.fillRect(
                sinkCenterX - sink.width / 2, 
                sink.y - sink.height / 2, 
                sink.width - SPACING, 
                sink.height
            );
            this.ctx.fillStyle = this.getColor(i).color;
            
            // Center the text better
            const text = (sink?.multiplier)?.toString() + "x";
            const textWidth = this.ctx.measureText(text).width;
            this.ctx.fillText(
                text, 
                sinkCenterX - textWidth / 2, 
                sink.y + 5 // Slightly lower for better centering
            );
        }
    }

    // ORIGINAL PLINKOO DRAWING LOOP - Exact replica
    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawObstacles();
        this.drawSinks();
        this.balls.forEach(ball => {
            ball.draw();
            ball.update();
        });
    }
    
    // ORIGINAL PLINKOO UPDATE LOOP - Exact replica
    update() {
        this.draw();
        this.requestId = requestAnimationFrame(this.update.bind(this));
    }

    // ORIGINAL PLINKOO STOP FUNCTION - Exact replica
    stop() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }

    // GORBAGANA COMPATIBILITY METHODS (not in original plinkoo)
    getBallCount(): number {
        return this.balls.length;
    }

    isAnimating(): boolean {
        return this.balls.length > 0;
    }

    destroy() {
        this.stop();
        this.balls = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        }
        console.log('🧹 BallManager destroyed');
    }
}
