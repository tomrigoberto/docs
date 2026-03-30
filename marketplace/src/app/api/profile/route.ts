import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      city: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      dogs: { orderBy: { createdAt: "desc" } },
      _count: { select: { reviews: true, placesAdded: true } },
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const data = await req.json();
  const updated = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: {
      name: data.name,
      bio: data.bio || null,
      city: data.city || null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      avatar: data.avatar || null,
    },
  });

  return NextResponse.json(updated);
}
