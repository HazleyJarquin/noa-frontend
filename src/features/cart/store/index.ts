import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// One line per variant: the same notebook in two colors is two lines
export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  category?: string;
  variantLabel?: string; // e.g. "Azul Marino · Cuadriculado"
  price: number;
  image?: string;
  // Stock when the item was added; checkout re-validates against Supabase
  stock: number;
  quantity: number;
};

export type CartItemInput = Omit<CartItem, "quantity">;

type CartState = {
  items: CartItem[];
  addItem: (item: CartItemInput, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const clampToStock = (quantity: number, stock: number) =>
  Math.min(quantity, stock);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (input, quantity) =>
        set((state) => {
          if (input.stock <= 0) return state;

          const existing = state.items.find((item) => item.variantId === input.variantId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === input.variantId
                  ? {
                      ...item,
                      ...input,
                      quantity: clampToStock(item.quantity + quantity, input.stock),
                    }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...input, quantity: clampToStock(quantity, input.stock) },
            ],
          };
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId
                    ? { ...item, quantity: clampToStock(quantity, item.stock) }
                    : item,
                ),
        })),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "noa-cart",
      // v2 keys items by variant; older carts can't be mapped, so they're dropped
      version: 2,
      migrate: () => ({ items: [] }),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Selectors return primitives so subscribers only re-render when the value changes
export const selectItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const selectQuantityInCart = (variantId?: string) => (state: CartState) =>
  variantId
    ? (state.items.find((item) => item.variantId === variantId)?.quantity ?? 0)
    : 0;
