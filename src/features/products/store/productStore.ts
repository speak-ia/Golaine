import { create } from "zustand";
import type { Product } from "@shared/types/domainTypes";
import { MOCK_PRODUCTS } from "@features/products/data/mock-products";

const DEFAULT_CATEGORIES = ["Mode", "Textile", "Alimentation", "Beauté", "Accessoires"];

interface ProductStore {
  products: Product[];
  categories: string[];
  nextId: number;
  setProducts: (_products: Product[]) => void;
  setCategories: (_categories: string[]) => void;
  addProduct: (_product: Omit<Product, "id">) => void;
  updateProduct: (_id: number, _updates: Partial<Product>) => void;
  deleteProduct: (_id: number) => void;
  addCategory: (_name: string) => void;
  renameCategory: (_oldName: string, _newName: string) => void;
  deleteCategory: (_name: string) => void;
}

function nextIdFrom(products: Product[]): number {
  if (products.length === 0) return 1;
  return Math.max(...products.map((p) => p.id)) + 1;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: MOCK_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  nextId: nextIdFrom(MOCK_PRODUCTS),

  setProducts: (products) =>
    set({
      products,
      nextId: nextIdFrom(products),
    }),

  setCategories: (categories) => set({ categories }),

  addProduct: (product) =>
    set((state) => ({
      products: [{ ...product, id: state.nextId }, ...state.products],
      nextId: state.nextId + 1,
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  addCategory: (name) =>
    set((state) => {
      const exists = state.categories.some((c) => c.toLowerCase() === name.toLowerCase());
      if (exists) return state;
      return { categories: [...state.categories, name] };
    }),

  renameCategory: (oldName, newName) =>
    set((state) => ({
      categories: state.categories.map((c) => (c === oldName ? newName : c)),
      products: state.products.map((p) => (p.category === oldName ? { ...p, category: newName } : p)),
    })),

  deleteCategory: (name) =>
    set((state) => {
      const remaining = state.categories.filter((c) => c !== name);
      const fallback = remaining[0] || "";
      return {
        categories: remaining,
        products: state.products.map((p) => (p.category === name ? { ...p, category: fallback } : p)),
      };
    }),
}));
