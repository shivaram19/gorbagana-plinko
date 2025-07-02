import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useGameStore } from './store/gameStore';
import { WalletConnect } from './components/WalletConnect';
import { RoomList } from './components/RoomList';
import { GameRoom } from './components/GameRoom';
import { Navigation } from './components/Navigation';

function App() {
  const { currentPlayer } = useGameStore();

  // Show wallet connect if no player
  if (!currentPlayer) {
    return (
      <>
        <WalletConnect />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<RoomList />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/room/:roomId" element={<GameRoom />} />
          <Route path="/game" element={<GameRoom />} />
        </Routes>
        
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;