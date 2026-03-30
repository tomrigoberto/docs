"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlaceCard } from "@/components/PlaceCard";
import { MapView } from "@/components/MapView";
import { PLACE_TYPES, getPlaceIcon } from "@/lib/types";
import { DEFAULT_LAT, DEFAULT_LNG } from "@/lib/location";
import { Search, Map, List, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlacesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><span className="text-4xl animate-bounce">🐾</span></div>}>
      <PlacesContent />
    </Suspense>
  );
}

function PlacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchAddress, setSearchAddress] = useState("");

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
      );
    } else {
      setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [typeFilter]);

  async function fetchPlaces() {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/places?${params}`);
    const data = await res.json();
    setPlaces(data);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPlaces();
  }

  const mapMarkers = places
    .filter((p) => p.latitude && p.longitude)
    .map((p) => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      label: p.name,
      type: p.type,
      icon: getPlaceIcon(p.type),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header + Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Explore Dog-Friendly Places</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              view === "list" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              view === "map" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Map size={16} /> Map
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places, cities..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Type filter chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setTypeFilter("")}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !typeFilter ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {PLACE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(typeFilter === t.value ? "" : t.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === t.value ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Map view */}
      {view === "map" && userLocation && (
        <div className="mt-4">
          <MapView
            markers={mapMarkers}
            center={userLocation}
            onMarkerClick={(id) => router.push(`/places/${id}`)}
            className="h-[500px] w-full rounded-2xl"
          />
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="mt-6">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <span className="text-4xl">🐾</span>
              <p className="mt-2">Sniffing out places...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <span className="text-4xl">🐕</span>
              <p className="mt-2">No places found. Be the first to add one!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
