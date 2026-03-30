"use client";

import Link from "next/link";

interface DogCardProps {
  dog: {
    id: string;
    name: string;
    breed?: string | null;
    age?: number | null;
    size: string;
    avatar?: string | null;
    owner?: { name: string } | null;
  };
  showOwner?: boolean;
  action?: React.ReactNode;
}

const sizeEmoji: Record<string, string> = {
  SMALL: "🐕",
  MEDIUM: "🐕",
  LARGE: "🐕‍🦺",
  XLARGE: "🐕‍🦺",
};

export function DogCard({ dog, showOwner = false, action }: DogCardProps) {
  return (
    <div className="card overflow-hidden">
      <Link href={`/dogs/${dog.id}`}>
        <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-200">
          {dog.avatar ? (
            <img src={dog.avatar} alt={dog.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              {sizeEmoji[dog.size] || "🐕"}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-gray-900">{dog.name}</h3>
          {dog.breed && <p className="text-xs text-gray-500">{dog.breed}</p>}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            {dog.age && <span>{dog.age} yrs</span>}
            <span className="capitalize">{dog.size.toLowerCase()}</span>
          </div>
          {showOwner && dog.owner && (
            <p className="mt-1 text-xs text-gray-400">Parent: {dog.owner.name}</p>
          )}
        </div>
      </Link>
      {action && <div className="border-t px-3 py-2">{action}</div>}
    </div>
  );
}
