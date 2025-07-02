import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, Zap, AlertCircle, Play } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGorbaganaWallet } from '../hooks/useGorbaganaWallet';
import { useGameStore } from '../store/gameStore';

export const WalletConnect: React.FC = () => {
  const { publicKey, connected, balance, signAuthMessage } = useGorbaganaWallet();
  const { authenticate } = useGameStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    if (!connected || !publicKey) return;
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const signature = await signAuthMessage();
      await authenticate(publicKey, signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Demo mode - bypass wallet connection for testing
  const handleDemoMode = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Create a demo wallet address
      const demoWalletAddress = '0x' + Math.random().toString(16).substr(2, 40);
      const demoSignature = 'demo-signature-' + Date.now();
      
      await authenticate(demoWalletAddress, demoSignature);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Wallet Connected */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">🎒 Backpack Connected</h2>
              <p className="text-gray-400">
                {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </p>
            </div>

            {/* Balance Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">GOR Balance</span>
                <span className="text-2xl font-bold text-white">
                  {balance.toFixed(4)} GOR
                </span>
              </div>
            </div>

            {/* Authenticate Button */}
            <motion.button
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              whileHover={{ scale: !isAuthenticating ? 1.02 : 1 }}
              whileTap={{ scale: !isAuthenticating ? 0.98 : 1 }}
              className={`
                w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
                flex items-center justify-center space-x-2
                ${!isAuthenticating
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isAuthenticating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Enter Gorbagana Plinko</span>
                </>
              )}
            </motion.button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
                <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>🎒 Backpack + Gorbagana Testnet</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Real GOR token betting</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span>No RPC setup required!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            🎒 Connect with Backpack wallet for the best experience
          </p>
        </motion.div>

        {/* Wallet Connection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-500 hover:!to-pink-500 !font-bold !px-8 !py-3 !text-lg" />
          </div>

          {/* Demo Mode Button */}
          <motion.button
            onClick={handleDemoMode}
            disabled={isAuthenticating}
            whileHover={{ scale: !isAuthenticating ? 1.02 : 1 }}
            whileTap={{ scale: !isAuthenticating ? 0.98 : 1 }}
            className={`
              w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200
              flex items-center justify-center space-x-2 mb-6
              ${!isAuthenticating
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isAuthenticating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Demo Mode (Testing)</span>
              </>
            )}
          </motion.button>

          {/* Backpack Info */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg mb-6">
            <div className="text-center">
              <p className="text-sm text-purple-400 font-semibold flex items-center justify-center">
                🎒 <span className="ml-2">Backpack + Gorbagana = Perfect Match</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Backpack automatically handles Gorbagana testnet - no manual setup needed!
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <span>Install <strong>Backpack wallet</strong> extension (recommended for Gorbagana)</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <span><strong>No RPC setup required</strong> - Backpack handles Gorbagana automatically</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <span>Get test GOR tokens and start playing!</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Backpack Download Link */}
          <div className="mt-6 text-center">
            <a 
              href="https://www.backpack.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Don't have Backpack? Download here →
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};