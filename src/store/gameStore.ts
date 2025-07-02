import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Room, Player, ChatMessage, GameRound, GameState, WebSocketMessage } from '../types/game';

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
  
  // Room actions
  setRooms: (rooms: Room[]) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  
  // Game actions
  placeBet: (slotNumber: number, amount: number) => void;
  setSelectedSlot: (slot: number | null) => void;
  setBetAmount: (amount: number) => void;
  setShowBetModal: (show: boolean) => void;
  
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
    betAmount: 100,
    showBetModal: false,
    
    // Connection actions
    connect: (walletAddress: string) => {
      // Construct WebSocket URL dynamically for webcontainer environment
      const hostname = window.location.hostname;
      const serverPort = import.meta.env.VITE_SERVER_PORT || '3001';
      
      // Replace the client port (5173) with server port (3001) in the hostname
      const wsHostname = hostname.replace(/--5173--/, `--${serverPort}--`);
      const wsUrl = `ws://${wsHostname}?address=${walletAddress}`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        set({ isConnected: true, connectionError: null, ws });
      };
      
      ws.onclose = () => {
        set({ isConnected: false, ws: null });
      };
      
      ws.onerror = (error) => {
        set({ connectionError: 'Connection failed', isConnected: false });
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
    
    // Game actions
    placeBet: (slotNumber: number, amount: number) => {
      get().sendMessage({
        type: 'bet_placed',
        data: { slotNumber, amount },
        timestamp: Date.now()
      });
      set({ showBetModal: false });
    },
    
    setSelectedSlot: (slot: number | null) => set({ selectedSlot: slot }),
    setBetAmount: (amount: number) => set({ betAmount: amount }),
    setShowBetModal: (show: boolean) => set({ showBetModal: show }),
    
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
          set({ currentRound: data.round });
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