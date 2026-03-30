import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get friend requests for the current user's dogs
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  // Get all user's dogs
  const dogs = await prisma.dog.findMany({ where: { ownerId: userId }, select: { id: true } });
  const dogIds = dogs.map((d) => d.id);

  // Get requests received by user's dogs
  const received = await prisma.friendRequest.findMany({
    where: { toDogId: { in: dogIds }, status },
    include: {
      fromDog: { include: { owner: { select: { name: true } } } },
      toDog: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get requests sent by user's dogs
  const sent = await prisma.friendRequest.findMany({
    where: { fromDogId: { in: dogIds }, status },
    include: {
      toDog: { include: { owner: { select: { name: true } } } },
      fromDog: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all friends (accepted) for nearby feature
  let friends: any[] = [];
  if (status === "ACCEPTED") {
    const accepted = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { fromDogId: { in: dogIds }, status: "ACCEPTED" },
          { toDogId: { in: dogIds }, status: "ACCEPTED" },
        ],
      },
      include: {
        fromDog: { include: { owner: { select: { id: true, name: true, latitude: true, longitude: true, city: true } } } },
        toDog: { include: { owner: { select: { id: true, name: true, latitude: true, longitude: true, city: true } } } },
      },
    });

    friends = accepted.map((fr) => {
      const friendDog = dogIds.includes(fr.fromDogId) ? fr.toDog : fr.fromDog;
      return friendDog;
    });
  }

  return NextResponse.json({ received, sent, friends });
}

// Send a friend request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const { fromDogId, toDogId } = await req.json();
  const userId = (session.user as any).id;

  // Verify the fromDog belongs to the user
  const fromDog = await prisma.dog.findUnique({ where: { id: fromDogId } });
  if (!fromDog || fromDog.ownerId !== userId) {
    return NextResponse.json({ error: "Not your dog" }, { status: 403 });
  }

  // Don't friend your own dog
  const toDog = await prisma.dog.findUnique({ where: { id: toDogId } });
  if (!toDog) {
    return NextResponse.json({ error: "Dog not found" }, { status: 404 });
  }
  if (toDog.ownerId === userId) {
    return NextResponse.json({ error: "Cannot friend your own dog" }, { status: 400 });
  }

  // Check for existing request in either direction
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromDogId, toDogId },
        { fromDogId: toDogId, toDogId: fromDogId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Friend request already exists" }, { status: 409 });
  }

  const request = await prisma.friendRequest.create({
    data: { fromDogId, toDogId },
  });

  return NextResponse.json(request, { status: 201 });
}
