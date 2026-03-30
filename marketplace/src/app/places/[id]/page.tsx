"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PawRating } from "@/components/PawRating";
import { FeatureList } from "@/components/FeatureBadge";
import { MapView } from "@/components/MapView";
import { getPlaceIcon, getPlaceLabel, SUB_RATINGS, YES_NO_FEATURES } from "@/lib/types";
import { MapPin, Globe, Phone, Clock, User } from "lucide-react";
import Link from "next/link";

export default function PlaceDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [subRatings, setSubRatings] = useState<Record<string, number>>({});
  const [featureVotes, setFeatureVotes] = useState<Record<string, boolean | null>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlace();
  }, [id]);

  async function fetchPlace() {
    const res = await fetch(`/api/places/${id}`);
    if (res.ok) {
      setPlace(await res.json());
    }
    setLoading(false);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!overallRating) return;
    setSubmitting(true);

    const body: any = { overallRating, comment, ...subRatings };
    for (const [key, val] of Object.entries(featureVotes)) {
      if (val !== null) body[key] = val;
    }

    const res = await fetch(`/api/places/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowReviewForm(false);
      setOverallRating(0);
      setSubRatings({});
      setFeatureVotes({});
      setComment("");
      fetchPlace();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-4xl animate-bounce">🐾</span>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="text-5xl">🐕</span>
        <p className="text-gray-500">Place not found</p>
        <Link href="/places" className="btn-primary">Back to Explore</Link>
      </div>
    );
  }

  const ratingCategories = place.type === "DOG_PARK" ? SUB_RATINGS.DOG_PARK : SUB_RATINGS.general;
  const alreadyReviewed = session && place.reviews?.some((r: any) => r.user.id === (session.user as any).id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-brand-200 to-paw-200 md:h-64">
          {place.photo ? (
            <img src={place.photo} alt={place.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">
              {getPlaceIcon(place.type)}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                {getPlaceIcon(place.type)} {getPlaceLabel(place.type)}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">{place.name}</h1>
              <div className="mt-1 flex items-center gap-1 text-gray-500">
                <MapPin size={16} />
                <span className="text-sm">{place.address}, {place.city}, {place.state} {place.zipCode}</span>
              </div>
            </div>
            <div className="text-right">
              <PawRating rating={place.avgRating} size="lg" />
              <p className="mt-1 text-sm text-gray-500">{place.reviewCount} reviews</p>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {place.phone && (
              <a href={`tel:${place.phone}`} className="flex items-center gap-1 hover:text-brand-600">
                <Phone size={14} /> {place.phone}
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-600">
                <Globe size={14} /> Website
              </a>
            )}
            <span className="flex items-center gap-1 text-gray-400">
              <User size={14} /> Added by {place.addedBy.name}
            </span>
          </div>

          {place.description && (
            <p className="mt-4 text-gray-600">{place.description}</p>
          )}

          {/* Features */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Dog-Friendly Features</h3>
            <FeatureList place={place} />
          </div>

          {/* Sub-ratings */}
          {place.avgSubRatings && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Detailed Ratings</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {ratingCategories.map((cat) => {
                  const val = place.avgSubRatings[cat.key];
                  if (val === null) return null;
                  return (
                    <div key={cat.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-sm text-gray-600">{cat.label}</span>
                      <PawRating rating={val} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mt-6">
        <MapView
          markers={[{ id: place.id, lat: place.latitude, lng: place.longitude, label: place.name, icon: getPlaceIcon(place.type) }]}
          center={{ lat: place.latitude, lng: place.longitude }}
          zoom={15}
          className="h-[250px] w-full rounded-2xl"
        />
      </div>

      {/* Reviews section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Reviews ({place.reviewCount})</h2>
          {session && !alreadyReviewed && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary text-sm">
              Write a Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form onSubmit={submitReview} className="card mt-4 p-6">
            <h3 className="font-bold text-gray-900">Rate from your pup&apos;s perspective</h3>

            <div className="mt-4">
              <label className="label">Overall Paw Rating *</label>
              <PawRating rating={overallRating} size="lg" interactive onChange={setOverallRating} />
            </div>

            {/* Sub-ratings */}
            <div className="mt-6 space-y-3">
              <label className="label">Detailed Ratings (optional)</label>
              {ratingCategories.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cat.label}</span>
                  <PawRating
                    rating={subRatings[cat.key] || 0}
                    size="sm"
                    interactive
                    onChange={(v) => setSubRatings((prev) => ({ ...prev, [cat.key]: v }))}
                  />
                </div>
              ))}
            </div>

            {/* Feature votes */}
            <div className="mt-6 space-y-2">
              <label className="label">Confirm Features (optional)</label>
              {YES_NO_FEATURES.slice(0, 4).map((f) => (
                <div key={f.key} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-600">{f.icon} {f.label}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFeatureVotes((p) => ({ ...p, [`voted${f.key.charAt(0).toUpperCase()}${f.key.slice(1).replace(/^has|^is|^can/, (m) => m.charAt(0).toUpperCase() + m.slice(1))}`]: true }))}
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        featureVotes[`voted${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`] === true
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeatureVotes((p) => ({ ...p, [`voted${f.key.charAt(0).toUpperCase()}${f.key.slice(1).replace(/^has|^is|^can/, (m) => m.charAt(0).toUpperCase() + m.slice(1))}`]: false }))}
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        featureVotes[`voted${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`] === false
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="label">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Tell us about your pup's experience..."
              />
            </div>

            <button type="submit" disabled={submitting || !overallRating} className="btn-primary mt-4">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {/* Review list */}
        <div className="mt-4 space-y-4">
          {place.reviews?.map((review: any) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {review.user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{review.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <PawRating rating={review.overallRating} size="sm" />
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
              )}
              {/* Show sub-ratings if present */}
              <div className="mt-2 flex flex-wrap gap-2">
                {ratingCategories.map((cat) => {
                  const val = review[cat.key];
                  if (!val) return null;
                  return (
                    <span key={cat.key} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {cat.label}: {"🐾".repeat(val)}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          {place.reviews?.length === 0 && (
            <p className="py-8 text-center text-gray-400">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
}
