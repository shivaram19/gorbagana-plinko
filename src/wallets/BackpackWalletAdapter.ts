import { 
  BaseMessageSignerWalletAdapter,
  WalletAdapterNetwork,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletConnectionError
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

// Declare global interface for Backpack
declare global {
  interface Window {
    backpack?: {
      isBackpack: boolean;
      publicKey?: PublicKey;
      isConnected: boolean;
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: Transaction): Promise<Transaction>;
      signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
      signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
      on(event: string, callback: () => void): void;
      removeListener(event: string, callback: () => void): void;
    };
  }
}

export interface BackpackWalletAdapterConfig {
  network?: WalletAdapterNetwork;
}

export class BackpackWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = 'Backpack' as const;
  url = 'https://www.backpack.app';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDExMiAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMC41IDM2LjVDMTAuNSAyMy4xOTI0IDIxLjE5MjQgMTIuNSAzNC41IDEyLjVINzcuNUM5MC44MDc2IDEyLjUgMTAxLjUgMjMuMTkyNCAxMDEuNSAzNi41Vjc3LjVDMTAxLjUgOTAuODA3NiA5MC44MDc2IDEwMS41IDc3LjUgMTAxLjVIMzQuNUMyMS4xOTI0IDEwMS41IDEwLjUgOTAuODA3NiAxMC41IDc3LjVWMzYuNVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzIpIiBzdHJva2U9InVybCgjcGFpbnQxX2xpbmVhcl8xXzIpIiBzdHJva2Utd2lkdGg9IjMiLz4KPHN2ZyBpZD0iQmFja3BhY2siIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0LCAyMikiPgo8cGF0aCBkPSJNMjIuMjUgNDVINy43NUMzLjQ3NjU2IDQ1IDAuNzUgNDIuMzIzNCAwLjc1IDM4VjE2QzAuNzUgMTEuNjc2NiAzLjQ3NjU2IDkgNy43NSA5SDIyLjI1QzI2LjUyMzQgOSAyOS4yNSAxMS42NzY2IDI5LjI1IDE2VjM4QzI5LjI1IDQyLjMyMzQgMjYuNTIzNCA0NSAyMi4yNSA0NVoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xXzIiIHgxPSI1NiIgeTE9IjEyLjUiIHgyPSI1NiIgeTI9IjEwMS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNBQjlGRjIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNEY0NEUyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8xXzIiIHgxPSI1NiIgeTE9IjEyLjUiIHgyPSI1NiIgeTI9IjEwMS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNBQjlGRjIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNEY0NEUyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+';
  readonly supportedTransactionVersions = null;

  private _network: WalletAdapterNetwork;
  private _connecting: boolean;
  private _wallet: Window['backpack'] | null;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState;

  constructor(config?: BackpackWalletAdapterConfig) {
    super();

    this._network = config?.network || WalletAdapterNetwork.Devnet;
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;
    this._readyState = typeof window !== 'undefined' && window.backpack?.isBackpack
      ? WalletReadyState.Installed
      : WalletReadyState.NotDetected;
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return !!this._wallet?.isConnected;
  }

  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

      this._connecting = true;

      const wallet = window.backpack;
      if (!wallet?.isBackpack) throw new WalletNotReadyError('Backpack wallet not found!');

      wallet.on('connect', this._connected);
      wallet.on('disconnect', this._disconnected);

      try {
        const response = await wallet.connect();
        this._wallet = wallet;
        this._publicKey = response.publicKey;
      } catch (error: any) {
        throw new WalletConnectionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    if (wallet) {
      wallet.removeListener('connect', this._connected);
      wallet.removeListener('disconnect', this._disconnected);

      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit('error', new Error('Disconnect error'));
      }
    }

    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return await wallet.signTransaction(transaction);
      } catch (error: any) {
        throw new Error(`Transaction signing failed: ${error?.message}`);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        return await wallet.signAllTransactions(transactions);
      } catch (error: any) {
        throw new Error(`Transactions signing failed: ${error?.message}`);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const response = await wallet.signMessage(message);
        return response.signature;
      } catch (error: any) {
        throw new Error(`Message signing failed: ${error?.message}`);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  private _connected = () => {
    const wallet = this._wallet;
    if (wallet) {
      this._publicKey = wallet.publicKey || null;
      this.emit('connect', this._publicKey);
    }
  };

  private _disconnected = () => {
    if (this._wallet) {
      this._wallet.removeListener('connect', this._connected);
      this._wallet.removeListener('disconnect', this._disconnected);
      this._wallet = null;
      this._publicKey = null;
      this.emit('disconnect');
    }
  };
}