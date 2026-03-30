"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { PawRating } from "./PawRating";
import { getPlaceIcon, getPlaceLabel } from "@/lib/types";

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    photo?: string | null;
    avgRating: number;
    reviewCount: number;
    hasWater: boolean;
    hasFreeTreats: boolean;
    patioFriendly: boolean;
    canComeInside: boolean;
  };
}

export function PlaceCard({ place }: PlaceCardProps) {
  const features = [
    place.hasWater && "💧",
    place.hasFreeTreats && "🦴",
    place.patioFriendly && "☀️",
    place.canComeInside && "🏠",
  ].filter(Boolean);

  return (
    <Link href={`/places/${place.id}`} className="card group overflow-hidden">
      {/* Photo */}
      <div className="relative h-40 bg-gradient-to-br from-brand-100 to-brand-200">
        {place.photo ? (
          <img src={place.photo} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {getPlaceIcon(place.type)}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
          {getPlaceIcon(place.type)} {getPlaceLabel(place.type)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
          {place.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={14} />
          {place.city}, {place.state}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <PawRating rating={place.avgRating} size="sm" />
          <span className="text-xs text-gray-400">
            {place.reviewCount} {place.reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        {features.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            {features.map((f, i) => (
              <span key={i} className="text-lg" title={String(f)}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
