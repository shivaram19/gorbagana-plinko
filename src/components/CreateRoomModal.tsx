import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, DollarSign, Trophy } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: { name: string; maxPlayers: number; entryFee: number }) => void;
  isCreating?: boolean;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  isCreating = false
}) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [entryFee, setEntryFee] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || isCreating) return;

    await onCreateRoom({
      name: roomName.trim(),
      maxPlayers,
      entryFee
    });
    
    // Reset form only if not creating (will be reset when modal closes)
    if (!isCreating) {
      setRoomName('');
      setMaxPlayers(8);
      setEntryFee(100);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setRoomName('');
      setMaxPlayers(8);
      setEntryFee(100);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create New Room
              </h2>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className={`
                  p-2 rounded-lg transition-colors
                  ${isCreating 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  maxLength={50}
                  disabled={isCreating}
                  className={`
                    w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 
                    focus:border-transparent transition-all duration-200
                    ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  required
                />
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Players
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  disabled={isCreating}
                  className={`
                    w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                    transition-all duration-200
                    ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <option value={4}>4 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={10}>10 Players</option>
                  <option value={12}>12 Players</option>
                </select>
              </div>

              {/* Entry Fee */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Entry Fee (GOR)
                </label>
                <select
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseInt(e.target.value))}
                  disabled={isCreating}
                  className={`
                    w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                    transition-all duration-200
                    ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <option value={50}>50 GOR</option>
                  <option value={100}>100 GOR</option>
                  <option value={250}>250 GOR</option>
                  <option value={500}>500 GOR</option>
                  <option value={1000}>1000 GOR</option>
                  <option value={2500}>2500 GOR</option>
                </select>
              </div>

              {/* Preview */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <Trophy className="w-4 h-4 mr-2 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">Room Preview</span>
                </div>
                <div className="space-y-1 text-sm text-gray-300">
                  <p><span className="text-gray-400">Name:</span> {roomName || 'Untitled Room'}</p>
                  <p><span className="text-gray-400">Players:</span> 0/{maxPlayers}</p>
                  <p><span className="text-gray-400">Entry Fee:</span> {entryFee} GOR</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isCreating}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-semibold transition-colors
                    ${isCreating 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }
                  `}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={!roomName.trim() || isCreating}
                  whileHover={{ scale: roomName.trim() && !isCreating ? 1.02 : 1 }}
                  whileTap={{ scale: roomName.trim() && !isCreating ? 0.98 : 1 }}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200
                    flex items-center justify-center space-x-2
                    ${roomName.trim() && !isCreating
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Room</span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};