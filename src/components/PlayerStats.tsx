import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Clock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const PlayerStats: React.FC = () => {
  const { currentPlayer, currentRoom } = useGameStore();

  if (!currentPlayer) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="text-center text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Connect your wallet to view stats</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Trophy,
      label: 'Total Games',
      value: currentPlayer.totalGames.toLocaleString(),
      color: 'text-yellow-400'
    },
    {
      icon: TrendingUp,
      label: 'Total Winnings',
      value: `${currentPlayer.totalWinnings.toLocaleString()} GOR`,
      color: 'text-green-400'
    },
    {
      icon: Target,
      label: 'Win Rate',
      value: currentPlayer.totalGames > 0 
        ? `${Math.round((currentPlayer.totalWinnings / (currentPlayer.totalGames * 100)) * 100)}%`
        : '0%',
      color: 'text-purple-400'
    },
    {
      icon: Clock,
      label: 'Session Time',
      value: `${Math.floor((Date.now() - new Date(currentPlayer.joinedAt).getTime()) / 60000)}m`,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
      {/* Player Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {currentPlayer.walletAddress.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            {currentPlayer.displayName || 
             `${currentPlayer.walletAddress.slice(0, 6)}...${currentPlayer.walletAddress.slice(-4)}`}
          </h3>
          <p className="text-sm text-gray-400">
            {currentPlayer.isSpectator ? 'Spectator' : 'Player'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
          >
            <div className="flex items-center mb-2">
              <stat.icon className={`w-4 h-4 mr-2 ${stat.color}`} />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold text-white">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Room Info */}
      {currentRoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-4 border-t border-slate-700"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Room</span>
            <span className="text-white font-semibold">{currentRoom.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-400">Round</span>
            <span className="text-purple-400 font-semibold">#{currentRoom.currentRound}</span>
          </div>
        </motion.div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 bg-green-400 rounded-full mr-2"
        />
        <span className="text-sm text-green-400 font-semibold">Online</span>
      </div>
    </div>
  );
};