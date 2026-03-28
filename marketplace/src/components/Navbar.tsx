"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartItems = useCartStore((s) => s.items);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
              <Sparkles className="h-6 w-6" />
              TemplateVault
            </Link>
            <div className="hidden md:flex md:items-center md:gap-6">
              <Link href="/browse" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Browse
              </Link>
              {session?.user && (session.user as any).role === "creator" && (
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="hidden items-center gap-3 md:flex">
                <span className="text-sm text-gray-600">{session.user.name}</span>
                <button onClick={() => signOut()} className="btn-secondary text-xs">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden gap-2 md:flex">
                <Link href="/auth/signin" className="btn-secondary">Sign In</Link>
                <Link href="/auth/signup" className="btn-primary">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/browse" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
              Browse Templates
            </Link>
            {session?.user ? (
              <>
                {(session.user as any).role === "creator" && (
                  <Link href="/dashboard" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button onClick={() => signOut()} className="text-left text-sm font-medium text-gray-600">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-sm font-medium text-brand-600" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
