import { create } from "zustand";

interface CoinsState {
  coins: number | null;
  loading: boolean;
  setCoins: (coins: number) => void;
  decrementCoins: (amount: number) => void;
  incrementCoins: (amount: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useCoinsStore = create<CoinsState>((set) => ({
  coins: null,
  loading: true,
  setCoins: (coins) => set({ coins }),
  decrementCoins: (amount) =>
    set((state) => ({
      coins: state.coins !== null ? state.coins - amount : null,
    })),
  incrementCoins: (amount) =>
    set((state) => ({
      coins: state.coins !== null ? state.coins + amount : null,
    })),
  setLoading: (loading) => set({ loading }),
}));
