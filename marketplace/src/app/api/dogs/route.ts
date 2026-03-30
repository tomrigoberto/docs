import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  const session = await getServerSession(authOptions);
  const userId = ownerId || (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const dogs = await prisma.dog.findMany({
    where: { ownerId: userId },
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dogs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Dog name is required" }, { status: 400 });
    }

    const dog = await prisma.dog.create({
      data: {
        name: data.name,
        breed: data.breed || null,
        age: data.age ? parseInt(data.age) : null,
        size: data.size || "MEDIUM",
        weight: data.weight ? parseFloat(data.weight) : null,
        avatar: data.avatar || null,
        bio: data.bio || null,
        ownerId: (session.user as any).id,
      },
    });

    return NextResponse.json(dog, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to add dog" }, { status: 500 });
  }
}
