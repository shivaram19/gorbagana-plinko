import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect } = useGameStore();

  const handleConnect = async () => {
    if (!walletAddress.trim()) return;
    
    setIsConnecting(true);
    
    // Simulate wallet connection delay
    setTimeout(() => {
      connect(walletAddress.trim());
      setIsConnecting(false);
    }, 1500);
  };

  const generateMockAddress = () => {
    const chars = '0123456789ABCDEFabcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWalletAddress(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Gorbagana Plinko Wars
          </h1>
          <p className="text-gray-400">
            Connect your wallet to start playing
          </p>
        </motion.div>

        {/* Connection Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-400 mb-3">
              Wallet Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <motion.button
                onClick={generateMockAddress}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-600 text-white text-xs rounded font-semibold hover:bg-purple-500 transition-colors"
              >
                Demo
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click "Demo" for a mock wallet address
            </p>
          </div>

          <motion.button
            onClick={handleConnect}
            disabled={!walletAddress.trim() || isConnecting}
            whileHover={{ scale: walletAddress.trim() && !isConnecting ? 1.02 : 1 }}
            whileTap={{ scale: walletAddress.trim() && !isConnecting ? 0.98 : 1 }}
            className={`
              w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
              flex items-center justify-center space-x-2
              ${walletAddress.trim() && !isConnecting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isConnecting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </motion.button>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure wallet signature authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Real-time multiplayer gaming</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span>GOR token betting system</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-500 mt-6"
        >
          By connecting, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};