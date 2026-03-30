import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const place = await prisma.place.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      addedBy: { select: { name: true } },
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const avgRating =
    place.reviews.length > 0
      ? place.reviews.reduce((sum, r) => sum + r.overallRating, 0) / place.reviews.length
      : 0;

  // Compute average sub-ratings
  const subRatingKeys = [
    "staffFriendliness",
    "dogFriendliness",
    "treatsQuality",
    "waterAvailability",
    "safetyRating",
    "spaceRating",
    "cleanliness",
    "dogParentRating",
  ] as const;

  const avgSubRatings: Record<string, number | null> = {};
  for (const key of subRatingKeys) {
    const values = place.reviews
      .map((r) => r[key])
      .filter((v): v is number => v !== null);
    avgSubRatings[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }

  return NextResponse.json({
    ...place,
    avgRating,
    avgSubRatings,
    reviewCount: place.reviews.length,
  });
}
