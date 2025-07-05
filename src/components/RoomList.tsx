import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Clock, Play, Plus } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { CreateRoomModal } from './CreateRoomModal';
import { Room } from '../types/game';
import toast from 'react-hot-toast';

export const RoomList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { rooms, joinRoom, currentPlayer, refreshRooms } = useGameStore();

  // 🔧 FIXED: Refresh rooms when component mounts and when connected
  useEffect(() => {
    if (currentPlayer) {
      refreshRooms();
    }
  }, [currentPlayer, refreshRooms]);

  const handleJoinRoom = (roomId: string) => {
    if (currentPlayer) {
      joinRoom(roomId);
    }
  };

  const handleCreateRoom = async (roomData: { name: string; maxPlayers: number; entryFee: number }) => {
    setIsCreating(true);
    
    try {
      // Get the server URL dynamically
      const hostname = window.location.hostname;
      const serverPort = import.meta.env.VITE_SERVER_PORT || '3001';
      let wsHostname = hostname;
      
      if (hostname.includes('--5173--')) {
        wsHostname = hostname.replace('--5173--', `--${serverPort}--`);
      }
      
      const serverUrl = `http://${wsHostname}:${serverPort}`;
      
      console.log('🏠 Creating room with data:', roomData);
      console.log('📡 Using server URL:', serverUrl);
      
      const response = await fetch(`${serverUrl}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.statusText}`);
      }

      const newRoom = await response.json();
      
      console.log('✅ Room created successfully:', newRoom);
      toast.success(`Room "${roomData.name}" created successfully!`);
      setShowCreateModal(false);
      
      // 🔧 FIXED: The server now broadcasts to all clients, but also refresh locally to ensure sync
      setTimeout(() => {
        refreshRooms();
        console.log('🔄 Refreshed rooms after creation');
      }, 500); // Small delay to ensure server broadcast is processed
      
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
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
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Game Rooms
            </h1>
            <p className="text-gray-400 text-lg">
              Join a room or create your own to start playing • {rooms.length} active rooms
            </p>
          </div>
          
          {/* Create Room Button */}
          <motion.button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
            className={`
              px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 
              flex items-center space-x-2
              ${isCreating 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              }
            `}
          >
            {isCreating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create Room</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Debug/Manual Refresh Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={refreshRooms}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          🔄 Refresh Rooms
        </button>
      </div>

      {/* Rooms Grid */}
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
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getRoomStatusColor(room)} text-white text-xs font-semibold`}>
                  Round #{room.currentRound}
                </div>
                {room.entryFee === 0 && (
                  <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                    FREE
                  </div>
                )}
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
                  {room.playerCount === 1 && (
                    <span className="text-green-400 ml-1 text-xs">(Solo OK)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-400">
                  <Trophy className="w-4 h-4 mr-2" />
                  Entry Fee
                </span>
                <span className={`font-semibold ${room.entryFee === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {room.entryFee === 0 ? 'FREE' : `${room.entryFee} GOR`}
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

            {/* Join Button - Modified to allow joining even when room is "full" in testing mode */}
            <motion.button
              onClick={() => handleJoinRoom(room.id)}
              disabled={!currentPlayer}
              whileHover={{ scale: currentPlayer ? 1.02 : 1 }}
              whileTap={{ scale: currentPlayer ? 0.98 : 1 }}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
                flex items-center justify-center space-x-2
                ${!currentPlayer
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <Play className="w-4 h-4" />
              <span>
                {!currentPlayer ? 'Connect Wallet' : 'Join Room'}
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

            {/* Testing Mode Indicator */}
            {(room.entryFee === 0 || room.playerCount === 1) && (
              <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
                <p className="text-xs text-green-400">
                  🧪 Test Mode Room
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
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
          <p className="text-gray-400 mb-6">
            Be the first to create a room and start playing!
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            whileHover={{ scale: isCreating ? 1 : 1.02 }}
            whileTap={{ scale: isCreating ? 1 : 0.98 }}
            className={`
              px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 
              flex items-center space-x-2 mx-auto
              ${isCreating 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              }
            `}
          >
            {isCreating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create First Room</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
      />
    </div>
  );
};
