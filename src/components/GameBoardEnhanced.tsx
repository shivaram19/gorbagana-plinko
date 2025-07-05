import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { PlinkoSlot } from '../types/game';
import { BallManager } from '../game/classes/BallManager';
import { WIDTH, HEIGHT } from '../game/constants';

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

export const GameBoardEnhanced: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballManagerRef = useRef<BallManager | null>(null);
  const [winningSlot, setWinningSlot] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const { selectedSlot, setSelectedSlot, ballAnimating, setBallAnimating, currentRound } = useGameStore();

  // Initialize BallManager
  useEffect(() => {
    if (canvasRef.current && !ballManagerRef.current) {
      const ballManager = new BallManager(
        canvasRef.current,
        (slotNumber: number) => {
          console.log('🎯 Ball landed in slot:', slotNumber);
          setWinningSlot(slotNumber);
          setShowWinAnimation(true);
          setBallAnimating(false);
          
          // Flash the winning slot for 2 seconds
          setTimeout(() => {
            setShowWinAnimation(false);
          }, 2000);
        }
      );
      ballManagerRef.current = ballManager;
    }

    // Cleanup
    return () => {
      if (ballManagerRef.current) {
        ballManagerRef.current.stop();
        ballManagerRef.current = null;
      }
    };
  }, []);

  // Handle ball animation triggered by game state
  useEffect(() => {
    if (ballAnimating && ballManagerRef.current) {
      // Add slight random offset to starting position for more natural variation
      const randomOffset = (Math.random() - 0.5) * 60; // ±30 pixels
      const startX = WIDTH / 2 + randomOffset;
      
      ballManagerRef.current.addBall(startX);
      setWinningSlot(null);
      setShowWinAnimation(false);
    }
  }, [ballAnimating]);

  const handleSlotClick = (slot: PlinkoSlot) => {
    if (!ballAnimating && !ballManagerRef.current?.isAnimating()) {
      const newSlot = selectedSlot === slot.id ? null : slot.id;
      setSelectedSlot(newSlot);
    }
  };

  const handleStartGame = () => {
    const { selectedSlot, betAmount } = useGameStore.getState();
    if (!selectedSlot) {
      alert('Please select a slot first!');
      return;
    }
    
    if (ballAnimating || ballManagerRef.current?.isAnimating()) {
      alert('Please wait for the current ball to finish!');
      return;
    }
    
    useGameStore.getState().placeBet(selectedSlot, betAmount, 'free-play-signature');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* GameBoard Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-t-lg mb-2 text-center font-bold">
        🎯 Enhanced Plinko Game Board
      </div>
      
      {/* Plinko Board with Physics Engine */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        
        {/* Canvas for Physics-Based Animation */}
        <div className="relative h-96 mb-8 border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-700">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="absolute inset-0 w-full h-full"
            style={{ 
              background: 'linear-gradient(to bottom, #334155, #1e293b)',
              imageRendering: 'crisp-edges'
            }}
          />
          
          {/* Ball Drop Indicator */}
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
          
          {/* Target slot indicator */}
          {ballAnimating && selectedSlot && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-2 text-yellow-400 font-bold text-sm"
              style={{
                left: `${((selectedSlot - 1) / 15) * 100 + (100 / 15 / 2)}%`,
                transform: 'translateX(-50%)'
              }}
            >
              🎯 TARGET #{selectedSlot}
            </motion.div>
          )}
        </div>

        {/* Game Instructions */}
        <div className="mb-6 text-center">
          <h3 className="text-white text-xl font-bold mb-3">
            Choose Your Lucky Slot & Drop the Ball!
          </h3>
          <p className="text-gray-300 text-sm">
            Select any slot (1-15) and click "Add Ball" to watch realistic physics in action
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
        
        {/* Enhanced Add Ball Button */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={handleStartGame}
            className={`
              px-8 py-3 rounded-xl font-bold text-lg shadow-xl transform transition-all duration-200
              ${
                !selectedSlot || ballAnimating || ballManagerRef.current?.isAnimating()
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 hover:scale-105'
              }
            `}
            disabled={!selectedSlot || ballAnimating || ballManagerRef.current?.isAnimating()}
          >
            {ballAnimating || ballManagerRef.current?.isAnimating() 
              ? '🎲 Ball Dropping...' 
              : '🎲 Add Ball'
            }
          </button>
        </div>

        {/* Enhanced Slot Grid */}
        <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
          {PLINKO_SLOTS.map((slot) => (
            <motion.button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={ballAnimating || ballManagerRef.current?.isAnimating()}
              whileHover={{ scale: selectedSlot === slot.id ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative h-16 w-16 sm:w-20 rounded-lg bg-gradient-to-t ${slot.color} 
                shadow-lg border-2 border-white/20 flex flex-col items-center justify-center
                text-white font-bold text-xs sm:text-sm transition-all duration-200
                ${
                  selectedSlot === slot.id 
                    ? 'ring-4 ring-yellow-400 ring-opacity-50 shadow-yellow-400/50' 
                    : ''
                }
                ${
                  winningSlot === slot.id 
                    ? 'ring-4 ring-green-400 animate-pulse' 
                    : ''
                }
                ${
                  ballAnimating || ballManagerRef.current?.isAnimating()
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl'
                }
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

        {/* Game Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          {selectedSlot && !ballAnimating && !ballManagerRef.current?.isAnimating() && (
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-lg font-semibold text-white mb-2 p-3 bg-slate-800/50 rounded-lg"
            >
              🎯 Selected Slot #{selectedSlot} - {PLINKO_SLOTS.find(s => s.id === selectedSlot)?.multiplier}x multiplier
            </motion.p>
          )}
          
          {(ballAnimating || ballManagerRef.current?.isAnimating()) && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
            >
              <p className="text-xl font-bold text-yellow-400 mb-2">
                🎲 Realistic physics ball is dropping...
              </p>
              <p className="text-sm text-yellow-300">
                Watch the ball bounce off pegs with real collision detection!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Physics Info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>✨ Enhanced with realistic physics: gravity, friction, collision detection & bouncing effects</p>
        </div>
      </div>
    </div>
  );
};
