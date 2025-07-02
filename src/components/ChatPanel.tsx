import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { MessageType } from '../types/game';

export const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    chatMessages, 
    sendChatMessage, 
    currentRoom, 
    currentPlayer,
    typingUsers 
  } = useGameStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentPlayer) {
      sendChatMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case 'SYSTEM':
        return '🔔';
      case 'BET_PLACED':
        return '💰';
      case 'GAME_EVENT':
        return '🎮';
      default:
        return '💬';
    }
  };

  const getMessageColor = (type: MessageType) => {
    switch (type) {
      case 'SYSTEM':
        return 'text-yellow-400';
      case 'BET_PLACED':
        return 'text-green-400';
      case 'GAME_EVENT':
        return 'text-purple-400';
      default:
        return 'text-white';
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Join a room to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-slate-700">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Room Chat
          </h3>
          <div className="flex items-center text-sm text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            {currentRoom.playerCount}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-start space-x-3 p-3 rounded-lg transition-all duration-200
                ${msg.type === 'SYSTEM' ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                  msg.type === 'BET_PLACED' ? 'bg-green-500/10 border border-green-500/20' :
                  'bg-slate-700/50 hover:bg-slate-700/70'}
              `}
            >
              <div className="text-lg">{getMessageIcon(msg.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-purple-400">
                    {msg.type === 'SYSTEM' ? 'System' : 
                     formatWalletAddress(msg.player.walletAddress)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className={`text-sm break-words ${getMessageColor(msg.type)}`}>
                  {msg.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicators */}
        <AnimatePresence>
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-2 text-gray-400 text-sm px-3"
            >
              <div className="flex space-x-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                />
              </div>
              <span>
                {Array.from(typingUsers).slice(0, 2).join(', ')} 
                {typingUsers.size > 2 ? ` and ${typingUsers.size - 2} others` : ''} 
                {typingUsers.size === 1 ? ' is' : ' are'} typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type your message..."
            maxLength={200}
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <motion.button
            type="submit"
            disabled={!message.trim() || !currentPlayer}
            whileHover={{ scale: message.trim() ? 1.05 : 1 }}
            whileTap={{ scale: message.trim() ? 0.95 : 1 }}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-all duration-200
              flex items-center space-x-2
              ${message.trim() && currentPlayer
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send</span>
          <span>{message.length}/200</span>
        </div>
      </form>
    </div>
  );
};