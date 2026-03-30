"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DogCard } from "@/components/DogCard";
import Link from "next/link";
import { Heart, User, MapPin } from "lucide-react";

export default function DogProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myDogs, setMyDogs] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchDog();
    if (session) fetchMyDogs();
  }, [id, session]);

  async function fetchDog() {
    const res = await fetch(`/api/dogs/${id}`);
    if (res.ok) setDog(await res.json());
    setLoading(false);
  }

  async function fetchMyDogs() {
    const res = await fetch("/api/dogs");
    if (res.ok) setMyDogs(await res.json());
  }

  async function sendFriendRequest(fromDogId: string) {
    setSending(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDogId, toDogId: id }),
    });
    if (res.ok) setSent(true);
    setSending(false);
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><span className="text-4xl animate-bounce">🐾</span></div>;
  }

  if (!dog) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐕</span>
        <p className="text-gray-500">Dog not found</p>
        <Link href="/places" className="btn-primary">Explore</Link>
      </div>
    );
  }

  const isOwner = session && (session.user as any)?.id === dog.owner?.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Dog Profile */}
      <div className="card overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-amber-200 to-orange-300">
          {dog.avatar ? (
            <img src={dog.avatar} alt={dog.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">🐕</div>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">{dog.name}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
            {dog.breed && <span>{dog.breed}</span>}
            {dog.age && <span>{dog.age} years old</span>}
            <span className="capitalize">{dog.size.toLowerCase()}</span>
            {dog.weight && <span>{dog.weight} lbs</span>}
          </div>
          {dog.bio && <p className="mt-3 text-gray-600">{dog.bio}</p>}

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <User size={14} />
            <span>Parent: {dog.owner?.name}</span>
            {dog.owner?.city && (
              <>
                <MapPin size={14} className="ml-2" />
                <span>{dog.owner.city}</span>
              </>
            )}
          </div>

          {/* Friend request */}
          {session && !isOwner && myDogs.length > 0 && (
            <div className="mt-4 border-t pt-4">
              {sent ? (
                <p className="text-sm text-green-600 font-medium">Friend request sent! The dog parent will review it.</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Send a friend request from:</p>
                  <div className="flex flex-wrap gap-2">
                    {myDogs.map((myDog) => (
                      <button
                        key={myDog.id}
                        onClick={() => sendFriendRequest(myDog.id)}
                        disabled={sending}
                        className="btn-secondary gap-1.5 text-sm"
                      >
                        <Heart size={14} /> {myDog.name} wants to be friends!
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Friends */}
      {dog.friends && dog.friends.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">
            {dog.name}&apos;s Friends ({dog.friends.length})
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {dog.friends.map((friend: any) => (
              <DogCard key={friend.id} dog={friend} showOwner />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
