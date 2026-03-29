"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cart";

export function AddToCartButton({ template }: { template: CartItem }) {
  const { items, addItem } = useCartStore();
  const inCart = items.some((i) => i.id === template.id);

  return (
    <button
      onClick={() => addItem(template)}
      disabled={inCart}
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
        inCart
          ? "bg-green-100 text-green-700 cursor-default"
          : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
