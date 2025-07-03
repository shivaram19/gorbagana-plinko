import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, Target, TestTube } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const BET_AMOUNTS = [0, 50, 100, 250, 500, 1000, 2500]; // Added 0 for testing

export const BettingPanel: React.FC = () => {
  const [customAmount, setCustomAmount] = useState('');
  const { 
    selectedSlot, 
    betAmount, 
    setBetAmount, 
    placeBet, 
    currentRoom, 
    currentPlayer,
    ballAnimating 
  } = useGameStore();

  const handlePlaceBet = () => {
    if (selectedSlot && currentPlayer && betAmount >= 0) { // Allow 0 betting
      placeBet(selectedSlot, betAmount);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    if (value || value === '0') { // Allow 0 value
      setBetAmount(parseInt(value) || 0);
    }
  };

  const getSlotMultiplier = (slotId: number) => {
    const multipliers: { [key: number]: number } = {
      1: 8, 2: 3, 3: 2, 4: 1.5, 5: 1.2, 6: 1.1, 7: 1, 8: 5,
      9: 1, 10: 1.1, 11: 1.2, 12: 1.5, 13: 2, 14: 3, 15: 8
    };
    return multipliers[slotId] || 1;
  };

  const potentialWin = selectedSlot ? betAmount * getSlotMultiplier(selectedSlot) : 0;
  const canPlaceBet = selectedSlot && betAmount >= 0 && currentPlayer && !ballAnimating && 
                     currentRoom?.gameState === 'BETTING';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          Place Your Bet
        </h3>
        <div className="flex items-center space-x-2">
          {currentRoom?.gameState === 'BETTING' && (
            <div className="flex items-center text-sm text-yellow-400">
              <Clock className="w-4 h-4 mr-1" />
              Betting Open
            </div>
          )}
          {/* Testing Mode Indicator */}
          <div className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
            <TestTube className="w-3 h-3 mr-1" />
            Test Mode
          </div>
        </div>
      </div>

      {/* Selected Slot Info */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Slot</p>
                <p className="text-xl font-bold text-white">
                  #{selectedSlot}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Multiplier</p>
                <p className="text-xl font-bold text-purple-400">
                  {getSlotMultiplier(selectedSlot)}x
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet Amount Selection */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">
          Bet Amount (GOR) 
          <span className="text-green-400 ml-2 text-xs">• Free testing enabled</span>
        </p>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BET_AMOUNTS.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => setBetAmount(amount)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 relative
                ${betAmount === amount
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }
              `}
            >
              {amount === 0 ? (
                <span className="flex items-center justify-center">
                  Free
                  <TestTube className="w-3 h-3 ml-1" />
                </span>
              ) : (
                amount
              )}
            </motion.button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="relative">
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Custom amount (0 for free)..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Potential Win Display */}
      <AnimatePresence>
        {selectedSlot && betAmount >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                <span className="text-sm text-gray-400">
                  {betAmount === 0 ? 'Test Win' : 'Potential Win'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {betAmount === 0 ? 'FREE' : `${potentialWin.toLocaleString()} GOR`}
                </p>
                <p className="text-sm text-gray-400">
                  ({betAmount} × {getSlotMultiplier(selectedSlot)})
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place Bet Button */}
      <motion.button
        onClick={handlePlaceBet}
        disabled={!canPlaceBet}
        whileHover={{ scale: canPlaceBet ? 1.02 : 1 }}
        whileTap={{ scale: canPlaceBet ? 0.98 : 1 }}
        className={`
          w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
          flex items-center justify-center space-x-2
          ${canPlaceBet
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <Target className="w-5 h-5" />
        <span>
          {!selectedSlot ? 'Select a Slot' : 
           !currentPlayer ? 'Connect Wallet' :
           ballAnimating ? 'Ball in Play' :
           currentRoom?.gameState !== 'BETTING' ? 'Betting Closed' :
           betAmount === 0 ? 'Test Play' : 'Place Bet'}
        </span>
      </motion.button>

      {/* Betting Instructions */}
      {!selectedSlot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <p className="text-sm text-blue-400 text-center">
            Click on a slot in the Plinko board to select it for betting
          </p>
        </motion.div>
      )}

      {/* Game State Info */}
      {currentRoom && currentRoom.gameState !== 'BETTING' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
        >
          <p className="text-sm text-yellow-400 text-center">
            {currentRoom.gameState === 'WAITING' && 'Waiting for game to start...'}
            {currentRoom.gameState === 'BALL_DROP' && 'Ball is dropping! Wait for results...'}
            {currentRoom.gameState === 'RESULTS' && 'Showing results...'}
          </p>
        </motion.div>
      )}

      {/* Testing Mode Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
      >
        <p className="text-xs text-green-400 text-center">
          🧪 Testing Mode: Zero GOR betting enabled • Single player rooms allowed
        </p>
      </motion.div>
    </div>
  );
};