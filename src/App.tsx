import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useGameStore } from './store/gameStore';
import { GorbaganaProvider } from './providers/GorbaganaProvider';
import { WalletConnect } from './components/WalletConnect';
import { RoomList } from './components/RoomList';
import { GameBoard } from './components/GameBoard';
import { ChatPanel } from './components/ChatPanel';
import { BettingPanel } from './components/BettingPanel';
import { PlayerStats } from './components/PlayerStats';
import { GameStateDebug } from './components/GameStateDebug';

function App() {
  return (
    <GorbaganaProvider>
      <AppContent />
      <GameStateDebug />
      <Toaster position="top-right" />
    </GorbaganaProvider>
  );
}

function AppContent() {
  const { currentPlayer, currentRoom } = useGameStore();

  // FOR TESTING: Add direct access to Plinko board
  const showPlinkoDirectly = window.location.search.includes('plinko=true');
  
  if (showPlinkoDirectly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gorbagana Plinko Wars - Demo
            </h1>
            <button
              onClick={() => window.location.href = window.location.pathname}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>

          {/* Main Game Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Mock Player Stats */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Demo Player</h3>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">0 GOR</div>
                    <div className="text-sm text-gray-400">Total Winnings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Game Board */}
            <div className="lg:col-span-2">
              <GameBoard />
            </div>

            {/* Right Panel - Mock Betting */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <h3 className="text-white font-bold mb-4">Demo Betting</h3>
                <div className="text-center">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
                    <div className="text-green-400 font-bold">Free Play Mode</div>
                    <div className="text-sm text-gray-400">No GOR required!</div>
                  </div>
                  <button 
                    onClick={() => {
                      const { selectedSlot } = useGameStore.getState();
                      if (!selectedSlot) {
                        alert('Please select a slot first!');
                        return;
                      }
                      // Mock the game store for demo
                      useGameStore.setState({ 
                        currentPlayer: { id: 'demo', walletAddress: '0xDemo', totalWinnings: 0 } as any,
                        currentRoom: { id: 'demo', name: 'Demo Room', gameState: 'WAITING' } as any 
                      });
                      useGameStore.getState().placeBet(selectedSlot, 0, 'free-play-signature');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-400 transition-all"
                  >
                    🎲 Start Demo Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet connect if no player
  if (!currentPlayer) {
    return <WalletConnect />;
  }

  // Show room list if not in a room
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <RoomList />
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
    </div>
  );
}

export default App;