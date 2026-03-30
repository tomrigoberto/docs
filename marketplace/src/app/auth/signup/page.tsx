"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, callbackUrl: "/dogs" });
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="text-5xl">🐾</span>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Join the Pack</h1>
          <p className="mt-1 text-sm text-gray-500">Create your RRRuff account and add your pup</p>
        </div>

        <form onSubmit={handleSubmit} className="card mt-8 p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label htmlFor="name" className="label">Your Name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Dog Parent Name" />
          </div>

          <div className="mt-4">
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? "Creating your den..." : "Create Account"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already in the pack?{" "}
            <Link href="/auth/signin" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
