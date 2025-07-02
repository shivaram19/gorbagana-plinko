export interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  entryFee: number;
  isActive: boolean;
  currentRound: number;
  gameState: GameState;
  createdAt: Date;
  updatedAt: Date;
  players: Player[];
  playerCount: number;
}

export interface Player {
  id: string;
  walletAddress: string;
  displayName?: string;
  roomId?: string;
  isSpectator: boolean;
  joinedAt: Date;
  lastActive: Date;
  totalGames: number;
  totalWinnings: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  playerId: string;
  message: string;
  timestamp: Date;
  type: MessageType;
  player: {
    walletAddress: string;
    displayName?: string;
  };
}

export interface GameRound {
  id: string;
  roomId: string;
  roundNumber: number;
  randomSeed?: string;
  winningSlot?: number;
  ballPath?: BallPath[];
  startTime: Date;
  endTime?: Date;
  bets: Bet[];
}

export interface Bet {
  id: string;
  playerId: string;
  roundId: string;
  slotNumber: number;
  amount: number;
  multiplier: number;
  isWinner: boolean;
  payout: number;
  placedAt: Date;
}

export interface BallPath {
  x: number;
  y: number;
  timestamp: number;
}

export interface PlinkoSlot {
  id: number;
  multiplier: number;
  color: string;
  position: number;
}

export enum GameState {
  WAITING = 'WAITING',
  BETTING = 'BETTING',
  BALL_DROP = 'BALL_DROP',
  RESULTS = 'RESULTS',
  FINISHED = 'FINISHED'
}

export enum MessageType {
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
  BET_PLACED = 'BET_PLACED',
  GAME_EVENT = 'GAME_EVENT'
}

export interface WebSocketMessage {
  type: 'room_update' | 'chat_message' | 'game_state_change' | 'bet_placed' | 
        'ball_result' | 'player_joined' | 'player_left' | 'error';
  data: any;
  timestamp: number;
}

export interface PhysicsConfig {
  gravity: number;
  bounce: number;
  friction: number;
  pegRadius: number;
  ballRadius: number;
  boardWidth: number;
  boardHeight: number;
}