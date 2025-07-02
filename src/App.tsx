import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameStore } from './store/gameStore';
import { WalletConnect } from './components/WalletConnect';
import { RoomList } from './components/RoomList';
import { GameBoard } from './components/GameBoard';
import { ChatPanel } from './components/ChatPanel';
import { BettingPanel } from './components/BettingPanel';
import { PlayerStats } from './components/PlayerStats';

function App() {
  const { currentPlayer, currentRoom } = useGameStore();

  // Show wallet connect if no player
  if (!currentPlayer) {
    return (
      <>
        <WalletConnect />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show room list if not in a room
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RoomList />
        <Toaster position="top-right" />
      </div>
    );
  }

  // Show game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentRoom.name}
          </h1>
          <button
            onClick={() => useGameStore.getState().leaveRoom()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Leave Room
          </button>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Player Stats */}
          <div className="lg:col-span-1">
            <PlayerStats />
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-2">
            <GameBoard />
          </div>

          {/* Right Panel - Betting & Chat */}
          <div className="lg:col-span-1 space-y-6">
            <BettingPanel />
            <div className="h-96">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}

export default App;