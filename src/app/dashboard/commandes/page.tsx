"use client";

import dynamic from "next/dynamic";

const OrdersPage = dynamic(() => import("@features/orders/components/OrdersPage"));

export default function CommandesRoutePage() {
  return <OrdersPage />;
}
