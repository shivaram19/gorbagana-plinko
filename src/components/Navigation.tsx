import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, LogOut, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { currentPlayer, currentRoom, disconnect } = useGameStore();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/rooms', icon: Users, label: 'Rooms' },
    { path: '/game', icon: Gamepad2, label: 'Game', disabled: !currentRoom },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gorbagana Plinko
              </h1>
              <p className="text-xs text-gray-400">Testing Mode</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative px-4 py-2 rounded-lg font-medium transition-all duration-200
                  flex items-center space-x-2
                  ${item.disabled 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : isActive(item.path)
                      ? 'text-white bg-purple-600/20'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                  }
                `}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:block">{item.label}</span>
                
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Current Room Indicator */}
            {currentRoom && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-400 font-medium">
                  {currentRoom.name}
                </span>
              </div>
            )}

            {/* Player Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {currentPlayer?.walletAddress.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {currentPlayer?.displayName || 
                   `${currentPlayer?.walletAddress.slice(0, 6)}...${currentPlayer?.walletAddress.slice(-4)}`}
                </p>
                <p className="text-xs text-gray-400">Connected</p>
              </div>
            </div>

            {/* Disconnect Button */}
            <motion.button
              onClick={disconnect}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};