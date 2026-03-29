"use client";

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCartStore();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, price: i.salePrice ?? i.price })) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Browse our templates and find something you love.</p>
        <Link href="/browse" className="btn-primary mt-6 inline-flex items-center gap-2">
          Browse Templates <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex items-center gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <span className="text-xl font-bold text-brand-300">{item.title.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-400">
                    {item.format.toUpperCase()} &middot; by {item.creator}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.salePrice ?? item.price)}
                  </p>
                  {item.salePrice && (
                    <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={clearCart} className="mt-4 text-sm text-gray-400 hover:text-red-500">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Processing fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(total())}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary mt-6 w-full py-3"
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
