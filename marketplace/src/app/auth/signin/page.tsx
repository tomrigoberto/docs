"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="text-5xl">🐾</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome Back to the Pack</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your RRRuff account</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="********"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "Sniffing credentials..." : "Sign In"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            New to the pack?{" "}
            <Link href="/auth/signup" className="font-semibold text-brand-600 hover:text-brand-700">
              Join RRRuff
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Demo: dogparent@demo.com / demo1234
        </p>
      </div>
    </div>
  );
}
