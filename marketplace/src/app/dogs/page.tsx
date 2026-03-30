"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DogCard } from "@/components/DogCard";
import { DOG_SIZES } from "@/lib/types";
import { Plus } from "lucide-react";

export default function DogsPage() {
  const { data: session } = useSession();
  const [dogs, setDogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", breed: "", age: "", size: "MEDIUM", weight: "", bio: "", avatar: "",
  });

  useEffect(() => {
    if (session) fetchDogs();
  }, [session]);

  async function fetchDogs() {
    const res = await fetch("/api/dogs");
    if (res.ok) setDogs(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);

    const res = await fetch("/api/dogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", breed: "", age: "", size: "MEDIUM", weight: "", bio: "", avatar: "" });
      setShowForm(false);
      fetchDogs();
    }
    setSaving(false);
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐾</span>
        <p className="text-gray-600">Sign in to manage your dogs</p>
        <Link href="/auth/signin" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dogs</h1>
          <p className="text-sm text-gray-500">Manage your furry family members</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-1.5">
          <Plus size={16} /> Add Dog
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mt-6 p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Add a New Dog</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Buddy" />
            </div>
            <div>
              <label className="label">Breed</label>
              <input type="text" value={form.breed} onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))} className="input-field" placeholder="Golden Retriever" />
            </div>
            <div>
              <label className="label">Age (years)</label>
              <input type="number" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} className="input-field" min={0} max={30} />
            </div>
            <div>
              <label className="label">Size</label>
              <select value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} className="input-field">
                {DOG_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Weight (lbs)</label>
              <input type="number" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Photo URL</label>
              <input type="url" value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} className="input-field" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={2} className="input-field" placeholder="Tell us about your dog's personality..." />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Adding..." : "Add Dog"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center"><span className="text-4xl animate-bounce">🐾</span></div>
      ) : dogs.length === 0 ? (
        <div className="mt-8 card p-12 text-center">
          <span className="text-5xl">🐕</span>
          <p className="mt-4 text-gray-500">No dogs yet. Add your first pup to get started!</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}
    </div>
  );
}
