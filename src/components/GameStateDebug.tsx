import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameStateDebug: React.FC = () => {
  const { currentPlayer, currentRoom, selectedSlot, ballAnimating, isConnected } = useGameStore();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg text-xs z-50 max-w-xs backdrop-blur-sm">
      <h3 className="font-bold mb-2 text-green-400">ℹ️ Game Status</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Connected:</span>
          <span>{isConnected ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span>In Room:</span>
          <span>{currentRoom ? '✅' : '❌'}</span>
        </div>
        <div className="flex justify-between">
          <span>Selected:</span>
          <span className="text-yellow-400">{selectedSlot ? `Slot ${selectedSlot}` : 'None'}</span>
        </div>
        {currentRoom && (
          <div className="flex justify-between">
            <span>State:</span>
            <span className="text-purple-400 font-semibold">{currentRoom.gameState}</span>
          </div>
        )}
      </div>
    </div>
  );
};