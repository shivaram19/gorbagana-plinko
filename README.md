# Gorbagana Plinko Wars 🎮⛓️

A decentralized multiplayer Plinko betting game built on the Gorbagana testnet (Solana fork) with real GOR token integration.

## 🌟 Features

- **Real Blockchain Integration**: Built on Gorbagana testnet with native GOR tokens
- **Wallet Connection**: Supports Phantom, Solflare, and Backpack wallets
- **Multiplayer Gaming**: Real-time WebSocket-based gameplay
- **Secure Betting**: On-chain transaction verification for all bets
- **Chat System**: In-game communication between players
- **Responsive Design**: Modern UI with Tailwind CSS and Framer Motion

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Backend**: Node.js, Express, WebSocket
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: JWT with wallet signature verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Gorbagana testnet wallet with test GOR tokens

### Installation

1. **Clone and setup**:
```bash
cd gorbagana-plinko
chmod +x setup.sh
./setup.sh
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your Gorbagana testnet settings
```

3. **Update environment variables**:
```env
# Gorbagana Testnet Configuration
VITE_GORBAGANA_RPC_URL=https://testnet-rpc.gorbagana.com
VITE_HOUSE_WALLET=YourActualHouseWalletAddress
```

4. **Start development server**:
```bash
npm run dev
```

## 🔧 Configuration

### Gorbagana Testnet Setup

1. **Install a compatible wallet** (Phantom/Solflare)
2. **Add Gorbagana testnet** to your wallet:
   - Network Name: Gorbagana Testnet
   - RPC URL: https://testnet-rpc.gorbagana.com
   - Chain ID: gorbagana-testnet

3. **Get test GOR tokens** from the Gorbagana faucet

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gorbagana_plinko"

# Gorbagana Blockchain
VITE_GORBAGANA_RPC_URL=https://testnet-rpc.gorbagana.com
VITE_HOUSE_WALLET=YourHouseWalletPublicKey
VITE_MIN_BET_AMOUNT=0.1
VITE_MAX_BET_AMOUNT=1000

# Security
JWT_SECRET="your-secure-jwt-secret"

# Server
VITE_SERVER_PORT=3001
CLIENT_URL="http://localhost:5173"
```

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and select your Gorbagana-compatible wallet
2. **Authenticate**: Sign the authentication message to verify wallet ownership
3. **Join/Create Room**: Browse available rooms or create a new one
4. **Place Bets**: Select a slot and bet amount, then confirm the GOR transaction
5. **Watch the Ball**: See the Plinko ball drop and bounce through the pegs
6. **Collect Winnings**: Automatic payout based on the slot multiplier

## 📁 Project Structure

```
gorbagana-plinko/
├── src/
│   ├── components/          # React components
│   │   ├── WalletConnect.tsx    # Wallet connection UI
│   │   ├── BettingPanel.tsx     # Betting interface
│   │   ├── GameBoard.tsx        # Plinko game board
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   └── useGorbaganaWallet.ts # Wallet integration
│   ├── providers/          # Context providers
│   │   └── GorbaganaProvider.tsx # Wallet provider setup
│   ├── server/             # Backend server
│   │   ├── utils/              # Server utilities
│   │   │   ├── authUtils.ts        # Authentication
│   │   │   └── gorbaganaUtils.ts   # Blockchain verification
│   │   └── index.ts            # Main server file
│   ├── store/              # State management
│   │   └── gameStore.ts        # Zustand store
│   └── types/              # TypeScript definitions
├── prisma/                 # Database schema
└── package.json           # Dependencies
```

## 🔐 Security Features

- **Wallet Signature Verification**: All users must sign authentication messages
- **Transaction Verification**: On-chain verification of all betting transactions
- **JWT Authentication**: Secure session management
- **Rate Limiting**: Protection against spam and abuse
- **Input Validation**: Comprehensive validation of all user inputs

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection with different providers
- [ ] Authentication flow
- [ ] Room creation and joining
- [ ] Bet placement with real GOR transactions
- [ ] Game round execution
- [ ] Chat functionality
- [ ] Error handling

### Demo Mode

For testing without actual GOR tokens, the application includes a demo mode that simulates transactions while maintaining the full UI experience.

## 🚀 Deployment

### Production Checklist

1. **Update environment variables** for production
2. **Enable signature verification** (currently disabled for demo)
3. **Configure real house wallet** address
4. **Set up production database**
5. **Enable SSL/TLS** for WebSocket connections
6. **Configure rate limiting** and security headers

### Environment-Specific Configuration

```bash
# Production
VITE_GORBAGANA_RPC_URL=https://rpc.gorbagana.com
NODE_ENV=production

# Staging
VITE_GORBAGANA_RPC_URL=https://staging-rpc.gorbagana.com
NODE_ENV=staging
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Gorbagana Documentation**: [Add URL]
- **Testnet Faucet**: [Add URL]
- **Discord Community**: [Add URL]
- **Bug Reports**: [GitHub Issues]

## ⚠️ Disclaimer

This is a testnet application for educational and development purposes. Do not use real funds or deploy to mainnet without proper security audits.

---

**Built with ❤️ for the Gorbagana ecosystem**