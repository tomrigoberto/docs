"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DogCard } from "@/components/DogCard";
import { MapView } from "@/components/MapView";
import { DEFAULT_LAT, DEFAULT_LNG } from "@/lib/location";
import { Check, X, Search, Map, Users, Dog } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"friends" | "requests" | "search" | "nearby">("friends");
  const [friends, setFriends] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [myDogs, setMyDogs] = useState<any[]>([]);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchPending();
      fetchMyDogs();
      navigator.geolocation?.getCurrentPosition(
        (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setUserLoc({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
      );
    }
  }, [session]);

  async function fetchFriends() {
    const res = await fetch("/api/friends?status=ACCEPTED");
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
    }
    setLoading(false);
  }

  async function fetchPending() {
    const res = await fetch("/api/friends?status=PENDING");
    if (res.ok) {
      const data = await res.json();
      setReceived(data.received || []);
      setSent(data.sent || []);
    }
  }

  async function fetchMyDogs() {
    const res = await fetch("/api/dogs");
    if (res.ok) setMyDogs(await res.json());
  }

  async function handleDecision(requestId: string, status: "ACCEPTED" | "DECLINED") {
    await fetch(`/api/friends/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchPending();
    if (status === "ACCEPTED") fetchFriends();
  }

  async function searchDogs() {
    if (searchQuery.length < 2) return;
    const res = await fetch(`/api/dogs/search?q=${encodeURIComponent(searchQuery)}`);
    if (res.ok) setSearchResults(await res.json());
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐾</span>
        <p className="text-gray-600">Sign in to see your dog friends</p>
        <Link href="/auth/signin" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const nearbyMarkers = friends
    .filter((f) => f.owner?.latitude && f.owner?.longitude)
    .map((f) => ({
      id: f.id,
      lat: f.owner.latitude,
      lng: f.owner.longitude,
      label: `${f.name} (${f.owner.name})`,
      icon: "🐕",
    }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Dog Friends</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {[
          { key: "friends", label: "Friends", icon: <Users size={16} />, count: friends.length },
          { key: "requests", label: "Requests", icon: <Dog size={16} />, count: received.length },
          { key: "search", label: "Find Dogs", icon: <Search size={16} /> },
          { key: "nearby", label: "Nearby Friends", icon: <Map size={16} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`ml-1 rounded-full px-1.5 text-xs ${tab === t.key ? "bg-white/20" : "bg-brand-100 text-brand-700"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends list */}
      {tab === "friends" && (
        <div className="mt-6">
          {loading ? (
            <div className="py-12 text-center"><span className="text-4xl animate-bounce">🐾</span></div>
          ) : friends.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-5xl">🐕‍🦺</span>
              <p className="mt-4 text-gray-500">No friends yet. Search for dogs to send friend requests!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {friends.map((dog) => (
                <DogCard key={dog.id} dog={dog} showOwner />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending requests */}
      {tab === "requests" && (
        <div className="mt-6 space-y-6">
          {received.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900">Pending Requests (Approve as Parent)</h3>
              <div className="mt-3 space-y-3">
                {received.map((req) => (
                  <div key={req.id} className="card flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">
                        <Link href={`/dogs/${req.fromDog.id}`} className="text-brand-600 hover:underline">
                          {req.fromDog.name}
                        </Link>
                        {" "}wants to be friends with{" "}
                        <span className="font-semibold">{req.toDog.name}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Parent: {req.fromDog.owner?.name} &middot; {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(req.id, "ACCEPTED")}
                        className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, "DECLINED")}
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sent.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900">Sent Requests</h3>
              <div className="mt-3 space-y-3">
                {sent.map((req) => (
                  <div key={req.id} className="card flex items-center justify-between p-4">
                    <p className="text-sm">
                      <span className="font-medium">{req.fromDog.name}</span> &rarr;{" "}
                      <Link href={`/dogs/${req.toDog.id}`} className="text-brand-600 hover:underline">{req.toDog.name}</Link>
                    </p>
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {received.length === 0 && sent.length === 0 && (
            <div className="card p-12 text-center">
              <span className="text-4xl">📬</span>
              <p className="mt-4 text-gray-500">No pending requests</p>
            </div>
          )}
        </div>
      )}

      {/* Search dogs */}
      {tab === "search" && (
        <div className="mt-6">
          <form
            onSubmit={(e) => { e.preventDefault(); searchDogs(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field flex-1"
              placeholder="Search by dog name or breed..."
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {searchResults.map((dog) => (
                <DogCard key={dog.id} dog={dog} showOwner />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nearby friends map */}
      {tab === "nearby" && (
        <div className="mt-6">
          {nearbyMarkers.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="text-4xl">🗺️</span>
              <p className="mt-4 text-gray-500">No friends with location data yet. Ask friends to update their profile location!</p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Showing {nearbyMarkers.length} friend{nearbyMarkers.length !== 1 ? "s" : ""} on the map
              </p>
              <MapView
                markers={nearbyMarkers}
                center={userLoc || undefined}
                onMarkerClick={(id) => router.push(`/dogs/${id}`)}
                className="h-[500px] w-full rounded-2xl"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
