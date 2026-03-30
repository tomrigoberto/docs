import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlaceCard } from "@/components/PlaceCard";
import { PLACE_TYPES } from "@/lib/types";
import { MapPin, Search, Dog, Users, Star, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recentPlaces = await prisma.place.findMany({
    include: { reviews: { select: { overallRating: true } }, addedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const placesWithRating = recentPlaces.map((p) => ({
    ...p,
    avgRating: p.reviews.length > 0 ? p.reviews.reduce((s, r) => s + r.overallRating, 0) / p.reviews.length : 0,
    reviewCount: p.reviews.length,
  }));

  const stats = await Promise.all([
    prisma.place.count(),
    prisma.review.count(),
    prisma.dog.count(),
    prisma.user.count(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-paw-600 py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-10 text-8xl">🐾</div>
          <div className="absolute right-20 top-20 text-6xl">🐕</div>
          <div className="absolute bottom-10 left-1/3 text-7xl">🦴</div>
          <div className="absolute bottom-20 right-10 text-8xl">🐾</div>
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white md:text-6xl">
            Every Sniff, <span className="text-amber-200">Rated.</span>
          </h1>
          <p className="mt-4 text-lg text-orange-100 md:text-xl">
            The #1 app for finding and rating dog-friendly places from your pup&apos;s perspective.
            Parks, patios, cafes &mdash; if dogs go there, we rate it.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/places" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition-all hover:shadow-xl hover:scale-105">
              <Search size={18} /> Explore Places
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20">
              <Dog size={18} /> Join the Pack
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Places", value: stats[0], icon: <MapPin size={20} /> },
            { label: "Reviews", value: stats[1], icon: <Star size={20} /> },
            { label: "Dogs", value: stats[2], icon: <Dog size={20} /> },
            { label: "Parents", value: stats[3], icon: <Users size={20} /> },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Place Types */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">Browse by Category</h2>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
          {PLACE_TYPES.map((t) => (
            <Link
              key={t.value}
              href={`/places?type=${t.value}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-3xl">{t.icon}</span>
              <span className="text-xs font-medium text-gray-600">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Places */}
      {placesWithRating.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
            <Link href="/places" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all &rarr;
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {placesWithRating.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">How RRRuff Works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              { icon: "🐾", title: "Create a Profile", desc: "Sign up and add your dog's profile with their personality and preferences." },
              { icon: "🗺️", title: "Explore Nearby", desc: "Find dog-friendly spots on the map near you or search any address." },
              { icon: "⭐", title: "Rate & Review", desc: "Rate places with paw ratings from your dog's perspective. Water bowls? Treats? Let everyone know!" },
              { icon: "🐕‍🦺", title: "Make Friends", desc: "Your dog can friend other dogs! Accept requests with parent permission." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
                  {step.icon}
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-paw-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Know a Great Spot?</h2>
          <p className="mt-3 text-orange-100">
            Help the pack by adding dog-friendly places. Every entry helps another pup find their new favorite hangout.
          </p>
          <Link href="/places/new" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition-all hover:shadow-xl">
            <Plus size={18} /> Add a Place
          </Link>
        </div>
      </section>
    </>
  );
}
