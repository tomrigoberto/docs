import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Check for existing review
  const existing = await prisma.review.findUnique({
    where: { placeId_userId: { placeId: params.id, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this place" }, { status: 409 });
  }

  try {
    const data = await req.json();

    if (!data.overallRating || data.overallRating < 1 || data.overallRating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        placeId: params.id,
        userId,
        overallRating: data.overallRating,
        staffFriendliness: data.staffFriendliness || null,
        dogFriendliness: data.dogFriendliness || null,
        treatsQuality: data.treatsQuality || null,
        waterAvailability: data.waterAvailability || null,
        safetyRating: data.safetyRating || null,
        spaceRating: data.spaceRating || null,
        cleanliness: data.cleanliness || null,
        dogParentRating: data.dogParentRating || null,
        votedHasWater: data.votedHasWater ?? null,
        votedHasFreeTreats: data.votedHasFreeTreats ?? null,
        votedPatioFriendly: data.votedPatioFriendly ?? null,
        votedCanComeInside: data.votedCanComeInside ?? null,
        comment: data.comment || null,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to submit review" }, { status: 500 });
  }
}
