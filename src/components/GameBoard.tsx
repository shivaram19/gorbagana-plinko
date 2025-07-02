import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PlinkoSlot, BallPath } from '../types/game';

const PLINKO_SLOTS: PlinkoSlot[] = [
  { id: 1, multiplier: 8, color: 'from-red-500 to-red-600', position: 0 },
  { id: 2, multiplier: 3, color: 'from-orange-500 to-orange-600', position: 1 },
  { id: 3, multiplier: 2, color: 'from-yellow-500 to-yellow-600', position: 2 },
  { id: 4, multiplier: 1.5, color: 'from-green-500 to-green-600', position: 3 },
  { id: 5, multiplier: 1.2, color: 'from-blue-500 to-blue-600', position: 4 },
  { id: 6, multiplier: 1.1, color: 'from-indigo-500 to-indigo-600', position: 5 },
  { id: 7, multiplier: 1, color: 'from-purple-500 to-purple-600', position: 6 },
  { id: 8, multiplier: 5, color: 'from-pink-500 to-pink-600', position: 7 },
  { id: 9, multiplier: 1, color: 'from-purple-500 to-purple-600', position: 8 },
  { id: 10, multiplier: 1.1, color: 'from-indigo-500 to-indigo-600', position: 9 },
  { id: 11, multiplier: 1.2, color: 'from-blue-500 to-blue-600', position: 10 },
  { id: 12, multiplier: 1.5, color: 'from-green-500 to-green-600', position: 11 },
  { id: 13, multiplier: 2, color: 'from-yellow-500 to-yellow-600', position: 12 },
  { id: 14, multiplier: 3, color: 'from-orange-500 to-orange-600', position: 13 },
  { id: 15, multiplier: 8, color: 'from-red-500 to-red-600', position: 14 },
];

export const GameBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const { selectedSlot, setSelectedSlot, ballAnimating, currentRound } = useGameStore();

  // Physics simulation
  useEffect(() => {
    if (ballAnimating && currentRound?.ballPath) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      animateBall(ctx, currentRound.ballPath as BallPath[]);
    }
  }, [ballAnimating, currentRound]);

  const animateBall = (ctx: CanvasRenderingContext2D, path: BallPath[]) => {
    let frameIndex = 0;
    
    const animate = () => {
      if (frameIndex >= path.length) {
        setBallPosition(null);
        return;
      }

      const point = path[frameIndex];
      setBallPosition({ x: point.x, y: point.y });
      
      // Clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Draw ball
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();

      frameIndex++;
      requestAnimationFrame(animate);
    };

    animate();
  };

  const handleSlotClick = (slot: PlinkoSlot) => {
    if (!ballAnimating) {
      setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Plinko Board */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        {/* Pegs Pattern */}
        <div className="relative h-96 mb-8">
          <canvas
            ref={canvasRef}
            width={800}
            height={384}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Animated Ball */}
          <AnimatePresence>
            {ballPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg"
                style={{
                  left: `${(ballPosition.x / 800) * 100}%`,
                  top: `${(ballPosition.y / 384) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </AnimatePresence>

          {/* Pegs Grid */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 384">
            {Array.from({ length: 12 }, (_, row) =>
              Array.from({ length: row + 4 }, (_, col) => {
                const x = 400 + (col - row / 2 - 1.5) * 50;
                const y = 50 + row * 25;
                return (
                  <circle
                    key={`${row}-${col}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#64748b"
                    className="drop-shadow-sm"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Slots */}
        <div className="grid grid-cols-15 gap-1">
          {PLINKO_SLOTS.map((slot) => (
            <motion.button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={ballAnimating}
              whileHover={{ scale: selectedSlot === slot.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative h-16 rounded-lg bg-gradient-to-t ${slot.color} 
                shadow-lg border-2 border-white/20 flex flex-col items-center justify-center
                text-white font-bold text-sm transition-all duration-200
                ${selectedSlot === slot.id ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
                ${ballAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
              `}
            >
              {selectedSlot === slot.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-yellow-400/20 rounded-lg"
                />
              )}
              
              <span className="text-xs opacity-80">#{slot.id}</span>
              <span className="text-lg font-black">{slot.multiplier}x</span>
              
              {/* Winning Animation */}
              {currentRound?.winningSlot === slot.id && (
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1], 
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg opacity-80"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Drop Zone Indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg flex items-center justify-center"
          >
            <div className="w-4 h-4 bg-white rounded-full opacity-80" />
          </motion.div>
        </div>
      </div>

      {/* Game Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        {selectedSlot && !ballAnimating && (
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-lg font-semibold text-white mb-2"
          >
            Selected Slot #{selectedSlot} - {PLINKO_SLOTS.find(s => s.id === selectedSlot)?.multiplier}x multiplier
          </motion.p>
        )}
        
        {ballAnimating && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-bold text-yellow-400"
          >
            Ball is dropping...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};