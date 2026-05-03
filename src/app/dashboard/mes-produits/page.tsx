"use client";

import dynamic from "next/dynamic";

const ProductsPage = dynamic(() => import("@features/products/components/ProductsPage"));

export default function MesProduitsRoutePage() {
  return <ProductsPage />;
}
