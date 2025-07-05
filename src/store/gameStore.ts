import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Room, Player, ChatMessage, GameRound, WebSocketMessage } from '../types/game';
import { authAPI, betAPI } from '../utils/api';

interface GameStore {
  // Connection state
  isConnected: boolean;
  ws: WebSocket | null;
  connectionError: string | null;
  
  // Player state
  currentPlayer: Player | null;
  
  // Room state
  rooms: Room[];
  currentRoom: Room | null;
  
  // Game state
  currentRound: GameRound | null;
  ballAnimating: boolean;
  
  // Chat state
  chatMessages: ChatMessage[];
  typingUsers: Set<string>;
  
  // UI state
  selectedSlot: number | null;
  betAmount: number;
  showBetModal: boolean;
  
  // Actions
  connect: (walletAddress: string) => void;
  disconnect: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  authenticate: (walletAddress: string, signature: string) => Promise<void>;
  
  // Room actions
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  refreshRooms: () => Promise<void>;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  
  // Game actions
  placeBet: (slotNumber: number, amount: number, transactionSignature?: string) => Promise<void>;
  setSelectedSlot: (slot: number | null) => void;
  setBetAmount: (amount: number) => void;
  setShowBetModal: (show: boolean) => void;
  resetGame: () => void;
  
  // Auto game flow actions
  startBettingPhase: () => void;
  startBallDrop: (winningSlot?: number) => Promise<void>;
  showResults: (winningSlot: number) => void;
  resetToWaiting: () => void;
  
  // Chat actions
  sendChatMessage: (message: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setTypingUsers: (users: Set<string>) => void;
  
  // State updates
  updateGameState: (data: any) => void;
  updateRoomState: (room: Room) => void;
  setBallAnimating: (animating: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isConnected: false,
    ws: null,
    connectionError: null,
    currentPlayer: null,
    rooms: [],
    currentRoom: null,
    currentRound: null,
    ballAnimating: false,
    chatMessages: [],
    typingUsers: new Set(),
    selectedSlot: null,
    betAmount: 0, // Default to free play
    showBetModal: false,
    
    // Authentication with signature verification
    authenticate: async (walletAddress: string, signature: string) => {
      try {
        console.log('🔐 Authenticating wallet:', walletAddress);
        
        // Verify signature on backend using API utility
        const { player, token } = await authAPI.verify(walletAddress, signature);
        
        // Store auth token and connect to WebSocket
        localStorage.setItem('auth_token', token);
        set({ currentPlayer: player });
        
        // Connect to WebSocket with auth token
        get().connect(walletAddress);
        
      } catch (error) {
        console.error('Authentication error:', error);
        throw error;
      }
    },
    
    // Connection actions
    connect: (walletAddress: string) => {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      // FIXED: Simplified WebSocket URL construction
      const isDev = import.meta.env.DEV;
      const serverPort = import.meta.env.VITE_SERVER_PORT || '3001';
      
      let wsUrl: string;
      
      if (isDev) {
        // Development: always use localhost
        wsUrl = `ws://localhost:${serverPort}?token=${token}&address=${walletAddress}`;
      } else {
        // Production: use current hostname with server port
        const hostname = window.location.hostname;
        wsUrl = `ws://${hostname}:${serverPort}?token=${token}&address=${walletAddress}`;
      }
      
      console.log(`🔗 WebSocket connecting to: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        set({ isConnected: true, connectionError: null, ws });
      };
      
      ws.onclose = () => {
        set({ isConnected: false, ws: null });
      };
      
      ws.onerror = (error) => {
        set({ connectionError: `Connection failed due to ${error}`, isConnected: false });
      };
      
      ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        get().updateGameState(message);
      };
    },
    
    disconnect: () => {
      const { ws } = get();
      if (ws) {
        ws.close();
      }
      // Clear auth token
      localStorage.removeItem('auth_token');
      set({ 
        isConnected: false, 
        ws: null, 
        currentRoom: null,
        currentPlayer: null,
        chatMessages: []
      });
    },
    
    sendMessage: (message: WebSocketMessage) => {
      const { ws } = get();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    
    // Room actions
    setRooms: (rooms: Room[]) => set({ rooms }),
    
    // 🔧 NEW: Add individual room to list
    addRoom: (room: Room) => {
      set((state) => ({
        rooms: [...state.rooms, room]
      }));
    },
    
    // 🔧 NEW: Refresh rooms from server
    refreshRooms: async () => {
      try {
        const hostname = window.location.hostname;
        const serverPort = import.meta.env.VITE_SERVER_PORT || '3001';
        let wsHostname = hostname;
        
        if (hostname.includes('--5173--')) {
          wsHostname = hostname.replace('--5173--', `--${serverPort}--`);
        }
        
        const serverUrl = `http://${wsHostname}:${serverPort}`;
        const response = await fetch(`${serverUrl}/api/rooms`);
        
        if (response.ok) {
          const rooms = await response.json();
          set({ rooms });
          console.log('🔄 Refreshed rooms:', rooms.length);
        }
      } catch (error) {
        console.error('Failed to refresh rooms:', error);
      }
    },
    
    joinRoom: (roomId: string) => {
      get().sendMessage({
        type: 'room_update',
        data: { action: 'join', roomId },
        timestamp: Date.now()
      });
    },
    
    leaveRoom: () => {
      const { currentRoom } = get();
      if (currentRoom) {
        get().sendMessage({
          type: 'room_update',
          data: { action: 'leave', roomId: currentRoom.id },
          timestamp: Date.now()
        });
      }
      set({ currentRoom: null, chatMessages: [] });
    },
    
    // Updated placeBet with original plinkoo integration
    placeBet: async (slotNumber: number, amount: number, transactionSignature?: string) => {
      try {
        // If we have a transaction signature, verify it first
        if (transactionSignature && transactionSignature !== 'demo-transaction-signature' && transactionSignature !== 'free-play-signature') {
          console.log('🔍 Verifying transaction:', transactionSignature);
          
          await betAPI.verify(
            transactionSignature,
            get().currentPlayer?.walletAddress || '',
            amount,
            slotNumber
          );
          
          console.log('✅ Transaction verified successfully');
        }
        
        // Send bet to WebSocket
        get().sendMessage({
          type: 'bet_placed',
          data: { 
            slotNumber, 
            amount, 
            transactionSignature: transactionSignature || 'demo-transaction-signature',
            timestamp: Date.now()
          },
          timestamp: Date.now()
        });
        
        set({ showBetModal: false });
        
        // 🎯 ORIGINAL PLINKOO STYLE - Simple ball drop
        console.log('🎯 Starting original plinkoo ball drop...');
        
        // Start ball animation immediately - let original plinkoo physics handle the rest
        set({ ballAnimating: true });
        
        // The ball will land wherever the original plinkoo physics takes it
        // Scoring will be handled by the ballLanded event in GameBoard
        
      } catch (error) {
        console.error('Bet placement error:', error);
        throw error;
      }
    },
    
    setSelectedSlot: (slot: number | null) => set({ selectedSlot: slot }),
    setBetAmount: (amount: number) => set({ betAmount: amount }),
    setShowBetModal: (show: boolean) => set({ showBetModal: show }),
    
    // ORIGINAL PLINKOO STYLE - Simple reset after ball lands
    resetGame: () => {
      console.log('🔄 Resetting game after ball landed (original plinkoo style)');
      set({ 
        ballAnimating: false,
        selectedSlot: null
      });
    },
    
    // Automated Game Flow Functions
    startBettingPhase: () => {
      console.log('🔄 Phase 1: Starting BETTING phase');
      const { currentRoom } = get();
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, gameState: 'BETTING' as const };
        set({ currentRoom: updatedRoom });
        
        // Show toast notification if available
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.success('🎲 Betting phase started!');
        }
      }
    },
    
    startBallDrop: async (winningSlot?: number) => {
      console.log('🔄 Phase 2: Starting BALL_DROP phase');
      const { currentRoom } = get();
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, gameState: 'BALL_DROP' as const };
        set({ currentRoom: updatedRoom, ballAnimating: true });
        
        // Simulate ball physics and animation
        const finalWinningSlot = winningSlot || Math.floor(Math.random() * 15) + 1;
        console.log('🎯 Ball dropping towards slot:', finalWinningSlot);
        
        // Show ball drop notification
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.info(`🎯 Ball is dropping... targeting slot ${finalWinningSlot}!`);
        }
        
        // Create realistic Plinko ball path with peg bouncing
        const ballPath = [];
        const startX = 400; // Center of board
        const startY = 30;  // Top of board
        
        // Peg positions (triangular grid like real Plinko)
        const pegRows = 12;
        const pegsPerRow = [];
        for (let row = 0; row < pegRows; row++) {
          pegsPerRow[row] = row + 4; // 4, 5, 6, ... pegs per row
        }
        
        // Calculate realistic ball bouncing path
        let currentX = startX;
        let currentY = startY;
        let velocityX = 0;
        const velocityY = 4; // Constant downward velocity
        
        // Ball will bounce left or right at each peg row
        for (let row = 0; row < pegRows; row++) {
          const rowY = 50 + row * 25; // Y position of this peg row
          const numPegs = pegsPerRow[row];
          const pegSpacing = 600 / (numPegs + 1);
          
          // Find which peg the ball hits in this row
          const pegIndex = Math.floor((currentX - 100) / pegSpacing);
          const pegX = 100 + (pegIndex + 1) * pegSpacing;
          
          // Ball bounces randomly left or right from peg
          const bounceDirection = Math.random() < 0.5 ? -1 : 1;
          const bounceAmount = 25 + Math.random() * 20; // More realistic bounce distance
          
          // Add smooth animation frames from current position to peg
          const framesToPeg = 6;
          for (let frame = 0; frame < framesToPeg; frame++) {
            const progress = frame / framesToPeg;
            
            // Add slight gravity curve
            const frameX = currentX + (pegX - currentX) * progress;
            const frameY = currentY + (rowY - currentY) * progress;
            
            ballPath.push({
              x: frameX,
              y: frameY,
              timestamp: Date.now() + ballPath.length * 70,
              isPegHit: frame === framesToPeg - 1 // Mark peg hit for visual effects
            });
          }
          
          // Add bounce effect frames
          const bounceFrames = 3;
          for (let bounceFrame = 0; bounceFrame < bounceFrames; bounceFrame++) {
            const bounceProgress = bounceFrame / bounceFrames;
            const bounceX = pegX + bounceDirection * bounceAmount * bounceProgress;
            const bounceY = rowY + Math.sin(bounceProgress * Math.PI) * 3; // Small vertical bounce
            
            ballPath.push({
              x: bounceX,
              y: bounceY,
              timestamp: Date.now() + ballPath.length * 70
            });
          }
          
          // Update position after bounce
          currentX = pegX + bounceDirection * bounceAmount;
          currentY = rowY;
          
          // Keep ball within bounds with wall bounces
          if (currentX < 120) {
            currentX = 120;
          } else if (currentX > 680) {
            currentX = 680;
          }
        }
        
        // Final fall to target slot with some influence toward winning slot
        const slotWidth = 600 / 15;
        const targetSlotX = 100 + (finalWinningSlot - 1) * slotWidth + (slotWidth / 2);
        
        // Gradually guide ball toward target slot
        const finalFrames = 20;
        for (let frame = 0; frame < finalFrames; frame++) {
          const progress = frame / finalFrames;
          const influence = 0.6; // How much to influence toward target (60%)
          
          const naturalX = currentX;
          const targetInfluence = targetSlotX * influence;
          const frameX = naturalX * (1 - progress * influence) + targetInfluence * progress;
          
          // Add gravity acceleration for final drop
          const gravity = 1 + progress * 2; // Accelerating fall
          const frameY = currentY + (380 - currentY) * progress * gravity;
          
          ballPath.push({
            x: frameX,
            y: frameY,
            timestamp: Date.now() + ballPath.length * 70,
            isSlotHit: frame === finalFrames - 1 // Mark slot hit
          });
        }
        
        // Update current round with ball path and winning slot
        set({
          currentRound: {
            id: 'demo-round',
            roomId: currentRoom.id,
            roundNumber: 1,
            ballPath,
            winningSlot: finalWinningSlot,
            startTime: new Date(),
            bets: []
          }
        });
      }
    },
    
    showResults: (winningSlot: number) => {
      console.log('🔄 Phase 3: Showing RESULTS phase');
      const { currentRoom, selectedSlot, betAmount } = get();
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, gameState: 'RESULTS' as const };
        set({ currentRoom: updatedRoom, ballAnimating: false });
        
        // Calculate winnings
        const isWinner = selectedSlot === winningSlot;
        const multipliers: { [key: number]: number } = {
          1: 8, 2: 3, 3: 2, 4: 1.5, 5: 1.2, 6: 1.1, 7: 1, 8: 5,
          9: 1, 10: 1.1, 11: 1.2, 12: 1.5, 13: 2, 14: 3, 15: 8
        };
        
        const multiplier = multipliers[winningSlot] || 1;
        const winnings = isWinner ? betAmount * multiplier : 0;
        
        console.log(`🎲 GAME RESULTS:`);
        console.log(`   Selected Slot: ${selectedSlot}`);
        console.log(`   Winning Slot: ${winningSlot}`);
        console.log(`   Bet Amount: ${betAmount} GOR`);
        console.log(`   ${isWinner ? '🏆 WINNER!' : '😭 LOSE'} Winnings: ${winnings} GOR`);
        
        // Show results notification
        if (typeof window !== 'undefined' && window.toast) {
          if (isWinner) {
            window.toast.success(`🏆 WINNER! Slot ${winningSlot} hit! You won ${winnings} GOR!`);
          } else {
            window.toast.error(`😭 No luck this time. Winning slot was ${winningSlot}.`);
          }
        }
      }
    },
    
    resetToWaiting: () => {
      console.log('🔄 Phase 4: Resetting to WAITING phase');
      const { currentRoom } = get();
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, gameState: 'WAITING' as const };
        set({ 
          currentRoom: updatedRoom, 
          ballAnimating: false,
          currentRound: null,
          selectedSlot: null 
        });
        console.log('✅ Game cycle complete! Ready for next bet.');
      }
    },
    
    // Chat actions
    sendChatMessage: (message: string) => {
      const { currentRoom } = get();
      if (currentRoom) {
        get().sendMessage({
          type: 'chat_message',
          data: { message, roomId: currentRoom.id },
          timestamp: Date.now()
        });
      }
    },
    
    addChatMessage: (message: ChatMessage) => {
      set(state => ({
        chatMessages: [...state.chatMessages, message].slice(-100) // Keep last 100 messages
      }));
    },
    
    setTypingUsers: (users: Set<string>) => set({ typingUsers: users }),
    
    // State update handler
    updateGameState: (message: WebSocketMessage) => {
      const { type, data } = message;
      
      switch (type) {
        case 'room_update':
          if (data.rooms) {
            set({ rooms: data.rooms });
          }
          if (data.room) {
            set({ currentRoom: data.room });
          }
          if (data.player) {
            set({ currentPlayer: data.player });
          }
          break;
          
        case 'chat_message':
          get().addChatMessage(data);
          break;
          
        case 'game_state_change':
          // Update current round if provided
          if (data.round) {
            set({ currentRound: data.round });
          }
          
          // Update room game state if provided
          if (data.gameState) {
            const { currentRoom } = get();
            if (currentRoom) {
              const updatedRoom = {
                ...currentRoom,
                gameState: data.gameState
              };
              set({ currentRoom: updatedRoom });
              console.log('🎮 Game state updated to:', data.gameState);
            }
          }
          
          // Handle winning slot for results
          if (data.winningSlot) {
            const { currentRound } = get();
            if (currentRound) {
              set({ 
                currentRound: { 
                  ...currentRound, 
                  winningSlot: data.winningSlot 
                } 
              });
            }
          }
          break;
          
        case 'ball_result':
          set({ ballAnimating: false });
          break;
          
        case 'error':
          console.error('WebSocket error:', data.message);
          break;
      }
    },
    
    updateRoomState: (room: Room) => set({ currentRoom: room }),
    setBallAnimating: (animating: boolean) => set({ ballAnimating: animating })
  }))
);
