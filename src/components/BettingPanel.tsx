import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useGorbaganaWallet } from '../hooks/useGorbaganaWallet';
import toast from 'react-hot-toast';

const BET_AMOUNTS = [0.1, 0.5, 1, 2.5, 5, 10]; // GOR amounts

export const BettingPanel: React.FC = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  
  const { 
    selectedSlot, 
    betAmount, 
    setBetAmount, 
    placeBet, 
    currentRoom, 
    currentPlayer,
    ballAnimating 
  } = useGameStore();
  
  const { balance, sendGOR } = useGorbaganaWallet();

  const handlePlaceBet = async () => {
    if (!selectedSlot || !currentPlayer || betAmount <= 0) return;
    
    if (betAmount > balance) {
      toast.error('Insufficient GOR balance');
      return;
    }

    setIsPlacingBet(true);
    
    try {
      // Send GOR to house wallet
      const houseWallet = import.meta.env.VITE_HOUSE_WALLET || 'YourHouseWalletOnGorbaganaTestnet';
      
      if (houseWallet === 'YourHouseWalletOnGorbaganaTestnet') {
        // For demo purposes - skip actual transaction
        console.log(`Demo: Would send ${betAmount} GOR to house wallet for slot ${selectedSlot}`);
        await placeBet(selectedSlot, betAmount, 'demo-transaction-signature');
        toast.success('Demo bet placed successfully!');
      } else {
        const signature = await sendGOR(houseWallet, betAmount);
        await placeBet(selectedSlot, betAmount, signature);
        toast.success('Bet placed successfully!');
      }
    } catch (error) {
      console.error('Bet placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    if (value) {
      setBetAmount(parseFloat(value));
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
  const canPlaceBet = selectedSlot && betAmount > 0 && currentPlayer && !ballAnimating && 
                     currentRoom?.gameState === 'BETTING' && !isPlacingBet && betAmount <= balance;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-purple-400" />
          Place Your Bet
        </h3>
        {currentRoom?.gameState === 'BETTING' && (
          <div className="flex items-center text-sm text-yellow-400">
            <Clock className="w-4 h-4 mr-1" />
            Betting Open
          </div>
        )}
      </div>

      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Your GOR Balance</span>
          <span className="text-lg font-bold text-green-400">
            {balance.toFixed(4)} GOR
          </span>
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
                <p className="text-xl font-bold text-white">#{selectedSlot}</p>
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
        <p className="text-sm text-gray-400 mb-3">Bet Amount (GOR)</p>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BET_AMOUNTS.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={amount > balance}
              whileHover={{ scale: amount <= balance ? 1.02 : 1 }}
              whileTap={{ scale: amount <= balance ? 0.98 : 1 }}
              className={`
                py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200
                ${betAmount === amount
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : amount <= balance
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-slate-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {amount}
            </motion.button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="relative">
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Custom amount..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        {/* Balance Warning */}
        {betAmount > balance && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center">
            <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-400 text-sm">Insufficient balance</span>
          </div>
        )}
      </div>

      {/* Potential Win Display */}
      <AnimatePresence>
        {selectedSlot && betAmount > 0 && betAmount <= balance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                <span className="text-sm text-gray-400">Potential Win</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  {potentialWin.toFixed(4)} GOR
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
        {isPlacingBet ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Placing Bet...</span>
          </>
        ) : (
          <>
            <Target className="w-5 h-5" />
            <span>
              {!selectedSlot ? 'Select a Slot' : 
               !currentPlayer ? 'Connect Wallet' :
               betAmount > balance ? 'Insufficient Balance' :
               ballAnimating ? 'Ball in Play' :
               currentRoom?.gameState !== 'BETTING' ? 'Betting Closed' :
               'Place Bet'}
            </span>
          </>
        )}
      </motion.button>

      {/* Instructions */}
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
    </div>
  );
};