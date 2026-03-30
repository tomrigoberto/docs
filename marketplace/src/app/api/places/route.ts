import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const where: any = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { address: { contains: search } },
    ];
  }

  const places = await prisma.place.findMany({
    where,
    include: {
      reviews: { select: { overallRating: true } },
      addedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const placesWithRating = places.map((p) => ({
    ...p,
    avgRating:
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.overallRating, 0) / p.reviews.length
        : 0,
    reviewCount: p.reviews.length,
  }));

  return NextResponse.json(placesWithRating);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const place = await prisma.place.create({
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone || null,
        website: data.website || null,
        description: data.description || null,
        photo: data.photo || null,
        addedById: (session.user as any).id,
        hasWater: data.hasWater ?? false,
        hasFreeTreats: data.hasFreeTreats ?? false,
        patioFriendly: data.patioFriendly ?? false,
        canComeInside: data.canComeInside ?? false,
        hasWasteStations: data.hasWasteStations ?? false,
        isOffLeashOk: data.isOffLeashOk ?? false,
        hasFencedArea: data.hasFencedArea ?? false,
        hasParking: data.hasParking ?? false,
        hasDogMenu: data.hasDogMenu ?? false,
      },
    });

    return NextResponse.json(place, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create place" }, { status: 500 });
  }
}
