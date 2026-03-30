"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PLACE_TYPES, YES_NO_FEATURES } from "@/lib/types";
import Link from "next/link";

export default function AddPlacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "RESTAURANT",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    phone: "",
    website: "",
    description: "",
    photo: "",
    hasWater: false,
    hasFreeTreats: false,
    patioFriendly: false,
    canComeInside: false,
    hasWasteStations: false,
    isOffLeashOk: false,
    hasFencedArea: false,
    hasParking: false,
    hasDogMenu: false,
  });

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((prev) => ({
        ...prev,
        latitude: String(pos.coords.latitude),
        longitude: String(pos.coords.longitude),
      }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.state || !form.latitude || !form.longitude) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      }),
    });

    if (res.ok) {
      const place = await res.json();
      router.push(`/places/${place.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add place");
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐾</span>
        <p className="text-gray-600">Sign in to add a new place</p>
        <Link href="/auth/signin" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Add a Dog-Friendly Place</h1>
      <p className="mt-1 text-sm text-gray-500">Help the pack discover a new spot!</p>

      <form onSubmit={handleSubmit} className="card mt-6 p-6 space-y-5">
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Basic Info */}
        <div>
          <label className="label">Place Name *</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input-field" placeholder="e.g. Bark & Brew Cafe" />
        </div>

        <div>
          <label className="label">Type *</label>
          <select value={form.type} onChange={(e) => update("type", e.target.value)} className="input-field">
            {PLACE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="input-field" placeholder="What makes this place dog-friendly?" />
        </div>

        {/* Address */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Street Address *</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">City *</label>
            <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">State *</label>
            <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className="input-field" maxLength={2} placeholder="TX" />
          </div>
          <div>
            <label className="label">Zip Code</label>
            <input type="text" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} className="input-field" />
          </div>
        </div>

        {/* Coordinates */}
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Coordinates *</label>
            <button type="button" onClick={useMyLocation} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Use my location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className="input-field" placeholder="Latitude" />
            <input type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className="input-field" placeholder="Longitude" />
          </div>
        </div>

        {/* Contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Website</label>
            <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className="input-field" placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="label">Photo URL</label>
          <input type="url" value={form.photo} onChange={(e) => update("photo", e.target.value)} className="input-field" placeholder="https://..." />
        </div>

        {/* Dog-Friendly Features */}
        <div>
          <label className="label">Dog-Friendly Features</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {YES_NO_FEATURES.map((f) => (
              <label key={f.key} className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 cursor-pointer hover:border-brand-300 transition-colors">
                <input
                  type="checkbox"
                  checked={(form as any)[f.key]}
                  onChange={(e) => update(f.key, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm">
                  {f.icon} {f.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Adding place..." : "Add Place"}
        </button>
      </form>
    </div>
  );
}
