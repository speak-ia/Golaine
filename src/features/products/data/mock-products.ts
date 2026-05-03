import type { Product } from "@shared/types/domainTypes";

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "Robe Wax S-400", price: 5000, category: "Mode", stock: 25, image: "/products/robe-wax.png", status: "actif", assignedAgent: "slot-alou" },
  { id: 2, name: "Pagne Tissé Premium", price: 8000, category: "Textile", stock: 15, image: "/products/pagne-tisse.png", status: "actif", assignedAgent: null },
  { id: 3, name: "Bissap 1L", price: 1500, category: "Alimentation", stock: 50, image: "/products/bissap.png", status: "actif", assignedAgent: "slot-alou" },
  { id: 4, name: "Huile d'Argan Bio", price: 12000, category: "Beauté", stock: 8, image: "/products/huile-argan.png", status: "actif", assignedAgent: "slot-2" },
  { id: 5, name: "Sac À Main Dakar", price: 6500, category: "Accessoires", stock: 20, image: "/products/sac-dakar.png", status: "actif", assignedAgent: null },
  { id: 6, name: "Thiakry Nature", price: 2000, category: "Alimentation", stock: 35, image: "/products/thiakry.png", status: "actif", assignedAgent: "slot-alou" },
  { id: 7, name: "Collier Traditionnel", price: 3500, category: "Accessoires", stock: 12, image: "/products/collier.png", status: "inactif", assignedAgent: "slot-3" },
  { id: 8, name: "Baobab Fruit Powder", price: 4500, category: "Alimentation", stock: 0, image: "/products/baobab-powder.png", status: "actif", assignedAgent: null },
  { id: 9, name: "Tunique Boubou", price: 9000, category: "Mode", stock: 18, image: "/products/tunique-boubou.png", status: "actif", assignedAgent: "slot-alou" },
  { id: 10, name: "Savon Noir Naturel", price: 2500, category: "Beauté", stock: 40, image: "/products/savon-noir.png", status: "actif", assignedAgent: "slot-2" },
  { id: 11, name: "Bijoux Mauritanien", price: 15000, category: "Accessoires", stock: 5, image: "/products/bijoux-mauritanien.png", status: "actif", assignedAgent: null },
  { id: 12, name: "Café Touba 500g", price: 3000, category: "Alimentation", stock: 22, image: "/products/cafe-touba.png", status: "actif", assignedAgent: "slot-alou" },
];
