"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DogCard } from "@/components/DogCard";
import { MapPin, Star, Plus, Edit2, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", city: "", latitude: "", longitude: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        city: data.city || "",
        latitude: data.latitude ? String(data.latitude) : "",
        longitude: data.longitude ? String(data.longitude) : "",
      });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditing(false);
      fetchProfile();
    }
    setSaving(false);
  }

  function useMyLocation() {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setForm((p) => ({ ...p, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) }));
    });
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐾</span>
        <p className="text-gray-600">Sign in to view your profile</p>
        <Link href="/auth/signin" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (!profile) {
    return <div className="flex min-h-[60vh] items-center justify-center"><span className="text-4xl animate-bounce">🐾</span></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {profile.name?.charAt(0) || "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-500">{profile.email}</p>
              {profile.city && (
                <p className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin size={14} /> {profile.city}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-ghost gap-1.5 text-sm">
            <Edit2 size={14} /> Edit
          </button>
        </div>

        {profile.bio && !editing && (
          <p className="mt-4 text-sm text-gray-600">{profile.bio}</p>
        )}

        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="font-bold text-gray-900">{profile._count.reviews}</span>
            <span className="ml-1 text-gray-500">Reviews</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{profile._count.placesAdded}</span>
            <span className="ml-1 text-gray-500">Places Added</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{profile.dogs.length}</span>
            <span className="ml-1 text-gray-500">Dogs</span>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSave} className="mt-4 space-y-3 border-t pt-4">
            <div>
              <label className="label">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={2} className="input-field" placeholder="Tell other dog parents about yourself" />
            </div>
            <div>
              <label className="label">City</label>
              <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="input-field" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Location (for nearby friends)</label>
                <button type="button" onClick={useMyLocation} className="text-xs font-medium text-brand-600">Use my location</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="any" value={form.latitude} onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))} className="input-field" placeholder="Latitude" />
                <input type="number" step="any" value={form.longitude} onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))} className="input-field" placeholder="Longitude" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary gap-1.5">
              <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-gray-400">
          Member since {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Dogs */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Dogs</h2>
          <Link href="/dogs" className="btn-primary gap-1.5 text-sm">
            <Plus size={14} /> Add Dog
          </Link>
        </div>
        {profile.dogs.length === 0 ? (
          <div className="mt-4 card p-8 text-center text-gray-400">
            <span className="text-4xl">🐕</span>
            <p className="mt-2">No dogs yet. Add your first pup!</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {profile.dogs.map((dog: any) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
