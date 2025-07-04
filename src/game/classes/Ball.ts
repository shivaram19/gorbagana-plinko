import { gravity, horizontalFriction, verticalFriction } from "../constants";
import { Obstacle, Sink } from "../objects";
import { pad, unpad } from "../padding";

// ORIGINAL PLINKOO BALL CLASS - Exact replica with gorbagana adaptations
export class Ball {
    private x: number;
    private y: number;
    private radius: number;
    private color: string;
    private vx: number;
    private vy: number;
    private ctx: CanvasRenderingContext2D;
    private obstacles: Obstacle[]
    private sinks: Sink[]
    private onFinish: (index: number) => void;

    constructor(
        x: number, 
        y: number, 
        radius: number, 
        color: string, 
        ctx: CanvasRenderingContext2D, 
        obstacles: Obstacle[], 
        sinks: Sink[], 
        onFinish: (index: number) => void
    ) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.ctx = ctx;
        this.obstacles = obstacles;
        this.sinks = sinks;
        this.onFinish = onFinish;
    }

    // ORIGINAL PLINKOO DRAWING - Exact replica
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(unpad(this.x), unpad(this.y), this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    // ORIGINAL PLINKOO PHYSICS UPDATE - Exact replica
    update() {
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // ORIGINAL PLINKOO OBSTACLE COLLISION - Exact replica
        this.obstacles.forEach(obstacle => {
            const dist = Math.hypot(this.x - obstacle.x, this.y - obstacle.y);
            if (dist < pad(this.radius + obstacle.radius)) {
                // Calculate collision angle
                const angle = Math.atan2(this.y - obstacle.y, this.x - obstacle.x);
                // Reflect velocity
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                this.vx = (Math.cos(angle) * speed * horizontalFriction);
                this.vy = Math.sin(angle) * speed * verticalFriction;

                // Adjust position to prevent sticking
                const overlap = this.radius + obstacle.radius - unpad(dist);
                this.x += pad(Math.cos(angle) * overlap);
                this.y += pad(Math.sin(angle) * overlap);
            }
        });

        // ORIGINAL PLINKOO SINK COLLISION - Fixed for proper center-based collision
        for (let i = 0; i < this.sinks.length; i++) {
            const sink = this.sinks[i];
            // FIXED: Proper collision detection with center-based positioning
            const sinkCenterX = sink.x + sink.width / 2;
            if (
                unpad(this.x) > (sinkCenterX - sink.width / 2) &&
                unpad(this.x) < (sinkCenterX + sink.width / 2) &&
                (unpad(this.y) + this.radius) > (sink.y - sink.height / 2)
            ) {
                this.vx = 0;
                this.vy = 0;
                // GORBAGANA ADAPTATION: Return 1-based index (was 0-based in original)
                console.log(`🎯 Ball collision detected in sink ${i + 1} at x=${unpad(this.x)}, sink center=${sinkCenterX}`);
                this.onFinish(i + 1);
                break;
            }
        }
    }
}
