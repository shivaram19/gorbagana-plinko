import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Clock, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Room } from '../types/game';

export const RoomList: React.FC = () => {
  const { rooms, joinRoom, currentPlayer } = useGameStore();

  const handleJoinRoom = (roomId: string) => {
    if (currentPlayer) {
      joinRoom(roomId);
    }
  };

  const getRoomStatusColor = (room: Room) => {
    switch (room.gameState) {
      case 'WAITING':
        return 'from-green-500 to-green-600';
      case 'BETTING':
        return 'from-yellow-500 to-yellow-600';
      case 'BALL_DROP':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getGameStateText = (state: string) => {
    switch (state) {
      case 'WAITING':
        return 'Waiting for players';
      case 'BETTING':
        return 'Betting in progress';
      case 'BALL_DROP':
        return 'Ball dropping';
      case 'RESULTS':
        return 'Showing results';
      default:
        return 'Unknown state';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Gorbagana Plinko Wars
        </h1>
        <p className="text-gray-400 text-lg">
          Join a room and start your Plinko adventure
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            {/* Room Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white truncate">
                {room.name}
              </h3>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRoomStatusColor(room)} text-white text-xs font-semibold`}>
                Round #{room.currentRound}
              </div>
            </div>

            {/* Room Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  Players
                </span>
                <span className="text-white font-semibold">
                  {room.playerCount}/{room.maxPlayers}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-400">
                  <Trophy className="w-4 h-4 mr-2" />
                  Entry Fee
                </span>
                <span className="text-yellow-400 font-semibold">
                  {room.entryFee} GOR
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  Status
                </span>
                <span className="text-white font-semibold">
                  {getGameStateText(room.gameState)}
                </span>
              </div>
            </div>

            {/* Player Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Room Capacity</span>
                <span>{Math.round((room.playerCount / room.maxPlayers) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(room.playerCount / room.maxPlayers) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Join Button */}
            <motion.button
              onClick={() => handleJoinRoom(room.id)}
              disabled={room.playerCount >= room.maxPlayers || !currentPlayer}
              whileHover={{ scale: room.playerCount >= room.maxPlayers ? 1 : 1.02 }}
              whileTap={{ scale: room.playerCount >= room.maxPlayers ? 1 : 0.98 }}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
                flex items-center justify-center space-x-2
                ${room.playerCount >= room.maxPlayers
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <Play className="w-4 h-4" />
              <span>
                {room.playerCount >= room.maxPlayers ? 'Room Full' : 'Join Room'}
              </span>
            </motion.button>

            {/* Recent Players */}
            {room.players && room.players.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-gray-400 mb-2">Recent Players:</p>
                <div className="flex -space-x-2">
                  {room.players.slice(0, 5).map((player, i) => (
                    <div
                      key={player.id}
                      className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                      title={player.walletAddress}
                    >
                      {player.walletAddress.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {room.players.length > 5 && (
                    <div className="w-8 h-8 bg-slate-600 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-gray-300">
                      +{room.players.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {rooms.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Active Rooms</h3>
          <p className="text-gray-400">
            Be the first to create a room and start playing!
          </p>
        </motion.div>
      )}
    </div>
  );
};