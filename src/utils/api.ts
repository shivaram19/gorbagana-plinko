// API utilities for proper backend communication

const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Vite proxy will forward to localhost:3001
  : `${window.location.protocol}//${window.location.hostname}:3001/api`;

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🔗 API Call: ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ API Error (${response.status}):`, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Specific API functions
export const authAPI = {
  verify: (walletAddress: string, signature: string) =>
    apiCall('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    }),
};

export const betAPI = {
  verify: (transactionSignature: string, walletAddress: string, amount: number, slotNumber: number) =>
    apiCall('/bets/verify', {
      method: 'POST',
      body: JSON.stringify({ transactionSignature, walletAddress, amount, slotNumber }),
    }),
};

export const roomAPI = {
  list: () => apiCall('/rooms'),
  create: (name: string, maxPlayers: number, entryFee: number) =>
    apiCall('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, maxPlayers, entryFee }),
    }),
};