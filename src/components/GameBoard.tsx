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
  const [winningSlot, setWinningSlot] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const { selectedSlot, setSelectedSlot, ballAnimating, currentRound } = useGameStore();

  // Physics simulation with better visual feedback
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
    setWinningSlot(null);
    setShowWinAnimation(false);
    
    const animate = () => {
      if (frameIndex >= path.length) {
        // Ball has finished dropping - show winning slot animation
        const finalWinningSlot = currentRound?.winningSlot;
        if (finalWinningSlot) {
          setWinningSlot(finalWinningSlot);
          setShowWinAnimation(true);
          
          // Flash the winning slot
          setTimeout(() => {
            setShowWinAnimation(false);
          }, 2000);
        }
        
        setBallPosition(null);
        useGameStore.getState().setBallAnimating(false);
        return;
      }

      const point = path[frameIndex];
      setBallPosition({ x: point.x, y: point.y });
      
      // Clear canvas completely for crisp visuals
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      // Add subtle background grid for better visibility
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= ctx.canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= ctx.canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      }
      
      // Enhanced ball trail for better visibility
      if (frameIndex > 0) {
        const trailLength = Math.min(8, frameIndex);
        for (let i = frameIndex - trailLength; i < frameIndex; i++) {
          if (i >= 0) {
            const trailPoint = path[i];
            const trailAlpha = (i - (frameIndex - trailLength)) / trailLength;
            
            ctx.globalAlpha = trailAlpha * 0.6;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(trailPoint.x, trailPoint.y, 8 * trailAlpha, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
          }
        }
      }
      
      // Draw main ball with enhanced visibility
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI); // Larger ball for better visibility
      
      // Enhanced gradient for better 3D effect
      const gradient = ctx.createRadialGradient(
        point.x - 4, point.y - 4, 0,
        point.x, point.y, 12
      );
      gradient.addColorStop(0, '#FFFACD');
      gradient.addColorStop(0.3, '#FFD700');
      gradient.addColorStop(0.8, '#FFA500');
      gradient.addColorStop(1, '#FF8C00');
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add bright border for definition
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add bright highlight
      ctx.beginPath();
      ctx.arc(point.x - 3, point.y - 3, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Highlight target slot as ball approaches bottom
      if (point.y > 300 && currentRound?.winningSlot) {
        const targetSlot = currentRound.winningSlot;
        const slotWidth = 600 / 15;
        const slotCenterX = 100 + (targetSlot - 1) * slotWidth + (slotWidth / 2);
        
        // Draw targeting indicator
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(slotCenterX, 370);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Highlight target slot area
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(100 + (targetSlot - 1) * slotWidth, 350, slotWidth, 30);
      }

      frameIndex++;
      // Slower animation for better visibility
      setTimeout(() => requestAnimationFrame(animate), 80); // 12.5fps for clearer tracking
    };

    animate();
  };

  const handleSlotClick = (slot: PlinkoSlot) => {
    if (!ballAnimating) {
      const newSlot = selectedSlot === slot.id ? null : slot.id;
      setSelectedSlot(newSlot);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* GameBoard Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-t-lg mb-2 text-center font-bold">
        🎯 Plinko Game Board
      </div>
      
      {/* Plinko Board */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        {/* Enhanced Pegs Pattern with better contrast */}
        <div className="relative h-96 mb-8 border-2 border-slate-600 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={384}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Enhanced Animated Ball */}
          <AnimatePresence>
            {ballPosition && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-xl border-2 border-yellow-600"
                style={{
                  left: `${(ballPosition.x / 800) * 100}%`,
                  top: `${(ballPosition.y / 384) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)'
                }}
              >
                <div className="absolute inset-1 bg-yellow-100 rounded-full opacity-60" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Peg Grid with better visibility */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 384">
            {/* Create triangular peg pattern */}
            {Array.from({ length: 12 }, (_, row) => {
              const pegsInRow = row + 4;
              const rowY = 50 + row * 25;
              const pegSpacing = 600 / (pegsInRow + 1);
              
              return Array.from({ length: pegsInRow }, (_, pegIndex) => {
                const pegX = 100 + (pegIndex + 1) * pegSpacing;
                
                return (
                  <g key={`${row}-${pegIndex}`}>
                    {/* Enhanced peg with glow */}
                    <circle
                      cx={pegX}
                      cy={rowY}
                      r="8"
                      fill="#64748b"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      className="drop-shadow-lg"
                      filter="url(#pegGlow)"
                    />
                    <circle
                      cx={pegX - 2}
                      cy={rowY - 2}
                      r="3"
                      fill="#cbd5e1"
                      opacity="0.8"
                    />
                  </g>
                );
              });
            })}
            
            {/* Glow filter for pegs */}
            <defs>
              <filter id="pegGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Enhanced side walls */}
            <line x1="90" y1="40" x2="90" y2="370" stroke="#475569" strokeWidth="4" />
            <line x1="710" y1="40" x2="710" y2="370" stroke="#475569" strokeWidth="4" />
            
            {/* Slot dividers for better visibility */}
            {Array.from({ length: 16 }, (_, i) => {
              const x = 100 + i * (600 / 15);
              return (
                <line
                  key={i}
                  x1={x}
                  y1="350"
                  x2={x}
                  y2="380"
                  stroke="#64748b"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Ball destination indicator */}
          {ballAnimating && currentRound?.winningSlot && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-2 text-yellow-400 font-bold text-sm"
              style={{
                left: `${((currentRound.winningSlot - 1) / 15) * 100 + (100 / 15 / 2)}%`,
                transform: 'translateX(-50%)'
              }}
            >
              🎯 TARGET
            </motion.div>
          )}
        </div>

        {/* Slot Selection Instructions */}
        <div className="mb-6 text-center">
          <h3 className="text-white text-xl font-bold mb-3">
            Choose Your Lucky Slot
          </h3>
          <p className="text-gray-300 text-sm">
            Select any slot (1-15) and place your bet to start the game
          </p>
          {winningSlot && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400 font-bold text-lg">
                🎉 Ball landed on Slot #{winningSlot}! 
                {selectedSlot === winningSlot ? ' YOU WON! 🏆' : ' Better luck next time! 😊'}
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Start Game Button */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => {
              const { selectedSlot, betAmount } = useGameStore.getState();
              if (!selectedSlot) {
                alert('Please select a slot first!');
                return;
              }
              useGameStore.getState().placeBet(selectedSlot, betAmount, 'free-play-signature');
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-400 hover:to-emerald-400 shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedSlot || ballAnimating}
          >
            {ballAnimating ? '🎲 Ball Dropping...' : '🎲 Start Game'}
          </button>
        </div>

        {/* Enhanced Slot Grid with better winning feedback */}
        <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
          {PLINKO_SLOTS.map((slot) => (
            <motion.button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={ballAnimating}
              whileHover={{ scale: selectedSlot === slot.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative h-16 w-16 sm:w-20 rounded-lg bg-gradient-to-t ${slot.color} 
                shadow-lg border-2 border-white/20 flex flex-col items-center justify-center
                text-white font-bold text-xs sm:text-sm transition-all duration-200
                ${selectedSlot === slot.id ? 'ring-4 ring-yellow-400 ring-opacity-50 shadow-yellow-400/50' : ''}
                ${winningSlot === slot.id ? 'ring-4 ring-green-400 animate-pulse' : ''}
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
              <span className="text-sm sm:text-lg font-black">{slot.multiplier}x</span>
              
              {/* Enhanced Winning Animation */}
              {winningSlot === slot.id && showWinAnimation && (
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1.3, 1.1, 1.3, 1], 
                    rotate: [0, 180, 360, 540, 720] 
                  }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg opacity-90 flex items-center justify-center"
                >
                  <span className="text-white text-2xl">🏆</span>
                </motion.div>
              )}

              {/* Selection indicator */}
              {selectedSlot === slot.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <span className="text-black text-xs font-bold">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Enhanced Ball Drop Indicator */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ 
              scale: ballAnimating ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: ballAnimating ? [0.8, 1, 0.8] : [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: ballAnimating ? 0.6 : 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg flex items-center justify-center border-2 border-yellow-700"
          >
            <div className="w-2 h-2 bg-white rounded-full opacity-80" />
          </motion.div>
        </div>
      </div>

      {/* Enhanced Game Status */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        {selectedSlot && !ballAnimating && (
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-lg font-semibold text-white mb-2 p-3 bg-slate-800/50 rounded-lg"
          >
            🎯 Selected Slot #{selectedSlot} - {PLINKO_SLOTS.find(s => s.id === selectedSlot)?.multiplier}x multiplier
          </motion.p>
        )}
        
        {ballAnimating && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
          >
            <p className="text-xl font-bold text-yellow-400 mb-2">
              🎲 Ball is dropping...
            </p>
            {currentRound?.winningSlot && (
              <p className="text-sm text-yellow-300">
                Targeting Slot #{currentRound.winningSlot}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};