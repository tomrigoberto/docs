"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, MapPin, Dog, Users, Plus, User, LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <span className="text-2xl font-extrabold text-brand-600">RRRuff</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/places" className="btn-ghost gap-1.5">
              <MapPin size={16} /> Explore
            </Link>
            {session && (
              <>
                <Link href="/places/new" className="btn-ghost gap-1.5">
                  <Plus size={16} /> Add Place
                </Link>
                <Link href="/dogs" className="btn-ghost gap-1.5">
                  <Dog size={16} /> My Dogs
                </Link>
                <Link href="/friends" className="btn-ghost gap-1.5">
                  <Users size={16} /> Friends
                </Link>
                <Link href="/profile" className="btn-ghost gap-1.5">
                  <User size={16} /> Profile
                </Link>
                <button onClick={() => signOut()} className="btn-ghost gap-1.5 text-red-500 hover:text-red-700">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
            {!session && (
              <>
                <Link href="/auth/signin" className="btn-ghost gap-1.5">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Join the Pack
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-gray-100 md:hidden">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="border-t border-gray-100 pb-4 md:hidden">
            <div className="flex flex-col gap-1 pt-2">
              <Link href="/places" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                <MapPin size={18} /> Explore Places
              </Link>
              {session ? (
                <>
                  <Link href="/places/new" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                    <Plus size={18} /> Add a Place
                  </Link>
                  <Link href="/dogs" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                    <Dog size={18} /> My Dogs
                  </Link>
                  <Link href="/friends" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                    <Users size={18} /> Dog Friends
                  </Link>
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                    <User size={18} /> Profile
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-orange-50">
                    <LogIn size={18} /> Sign In
                  </Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-primary mx-3 mt-2 text-center">
                    Join the Pack
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
