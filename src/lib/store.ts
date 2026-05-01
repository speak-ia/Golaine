import { create } from "zustand";

export type PageView = "landing" | "login" | "signup" | "dashboard";

export type SidebarView =
  | "dashboard"
  | "whatsapp"
  | "agent"
  | "tester"
  | "produits"
  | "conversations"
  | "contacts"
  | "commandes"
  | "rendezvous"
  | "rapport"
  | "plan"
  | "parametres";

/* ═══════════════════════════════════════════════════════════════
   PRODUCT TYPES & DATA
   ═══════════════════════════════════════════════════════════════ */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: "actif" | "inactif";
  assignedAgent: string | null;
}

export interface AgentIA {
  id: string;
  slotName: string;
  agentName: string;
  phone: string;
  status: "connected" | "inactive";
}

export const MOCK_AGENTS_IA: AgentIA[] = [
  { id: "slot-alou", slotName: "Alou Shop", agentName: "Assistan", phone: "+221 76 028 96 07", status: "connected" },
  { id: "slot-2", slotName: "Numéro 2", agentName: "", phone: "", status: "inactive" },
  { id: "slot-3", slotName: "Numéro 3", agentName: "", phone: "", status: "inactive" },
];

export const DEFAULT_CATEGORIES = [
  "Mode",
  "Textile",
  "Alimentation",
  "Beauté",
  "Accessoires",
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Robe Wax S-400", price: 5000, category: "Mode", stock: 25, image: "", status: "actif", assignedAgent: "slot-alou" },
  { id: 2, name: "Pagne Tissé Premium", price: 8000, category: "Textile", stock: 15, image: "", status: "actif", assignedAgent: null },
  { id: 3, name: "Bissap 1L", price: 1500, category: "Alimentation", stock: 50, image: "", status: "actif", assignedAgent: "slot-alou" },
  { id: 4, name: "Huile d'Argan Bio", price: 12000, category: "Beauté", stock: 8, image: "", status: "actif", assignedAgent: "slot-2" },
  { id: 5, name: "Sac À Main Dakar", price: 6500, category: "Accessoires", stock: 20, image: "", status: "actif", assignedAgent: null },
  { id: 6, name: "Thiakry Nature", price: 2000, category: "Alimentation", stock: 35, image: "", status: "actif", assignedAgent: "slot-alou" },
  { id: 7, name: "Collier Traditionnel", price: 3500, category: "Accessoires", stock: 12, image: "", status: "inactif", assignedAgent: "slot-3" },
  { id: 8, name: "Baobab Fruit Powder", price: 4500, category: "Alimentation", stock: 0, image: "", status: "actif", assignedAgent: null },
  { id: 9, name: "Tunique Boubou", price: 9000, category: "Mode", stock: 18, image: "", status: "actif", assignedAgent: "slot-alou" },
  { id: 10, name: "Savon Noir Naturel", price: 2500, category: "Beauté", stock: 40, image: "", status: "actif", assignedAgent: "slot-2" },
  { id: 11, name: "Bijoux Mauritanien", price: 15000, category: "Accessoires", stock: 5, image: "", status: "actif", assignedAgent: null },
  { id: 12, name: "Café Touba 500g", price: 3000, category: "Alimentation", stock: 22, image: "", status: "actif", assignedAgent: "slot-alou" },
];

/* ═══════════════════════════════════════════════════════════════
   AUTH STORE
   ═══════════════════════════════════════════════════════════════ */

interface AuthStore {
  pageView: PageView;
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  profilePhoto: string | null;
  setPageView: (view: PageView) => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarOpen: (open: boolean) => void;
  setProfilePhoto: (photo: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  pageView: "landing",
  sidebarView: "dashboard",
  sidebarOpen: true,
  profilePhoto: null,
  setPageView: (view) => set({ pageView: view }),
  setSidebarView: (view) => set({ sidebarView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setProfilePhoto: (photo) => set({ profilePhoto: photo }),
}));

/* ═══════════════════════════════════════════════════════════════
   PRODUCT STORE — persists across tab navigation
   ═══════════════════════════════════════════════════════════════ */

interface ProductStore {
  products: Product[];
  categories: string[];
  nextId: number;

  // Product CRUD
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;

  // Category CRUD
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: INITIAL_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  nextId: 13,

  addProduct: (product) =>
    set((state) => ({
      products: [{ ...product, id: state.nextId }, ...state.products],
      nextId: state.nextId + 1,
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  addCategory: (name) =>
    set((state) => {
      const exists = state.categories.some(
        (c) => c.toLowerCase() === name.toLowerCase()
      );
      if (exists) return state;
      return { categories: [...state.categories, name] };
    }),

  renameCategory: (oldName, newName) =>
    set((state) => ({
      categories: state.categories.map((c) => (c === oldName ? newName : c)),
      products: state.products.map((p) =>
        p.category === oldName ? { ...p, category: newName } : p
      ),
    })),

  deleteCategory: (name) =>
    set((state) => {
      const remaining = state.categories.filter((c) => c !== name);
      const fallback = remaining[0] || "";
      return {
        categories: remaining,
        products: state.products.map((p) =>
          p.category === name ? { ...p, category: fallback } : p
        ),
      };
    }),
}));
