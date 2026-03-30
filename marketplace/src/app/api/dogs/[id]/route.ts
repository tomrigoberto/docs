import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const dog = await prisma.dog.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, avatar: true, city: true } },
      sentRequests: {
        where: { status: "ACCEPTED" },
        include: { toDog: { select: { id: true, name: true, breed: true, avatar: true, owner: { select: { name: true } } } } },
      },
      receivedRequests: {
        where: { status: "ACCEPTED" },
        include: { fromDog: { select: { id: true, name: true, breed: true, avatar: true, owner: { select: { name: true } } } } },
      },
    },
  });

  if (!dog) {
    return NextResponse.json({ error: "Dog not found" }, { status: 404 });
  }

  // Combine friends from both directions
  const friends = [
    ...dog.sentRequests.map((r) => r.toDog),
    ...dog.receivedRequests.map((r) => r.fromDog),
  ];

  return NextResponse.json({ ...dog, friends });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const dog = await prisma.dog.findUnique({ where: { id: params.id } });
  if (!dog || dog.ownerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const data = await req.json();
  const updated = await prisma.dog.update({
    where: { id: params.id },
    data: {
      name: data.name ?? dog.name,
      breed: data.breed ?? dog.breed,
      age: data.age !== undefined ? (data.age ? parseInt(data.age) : null) : dog.age,
      size: data.size ?? dog.size,
      weight: data.weight !== undefined ? (data.weight ? parseFloat(data.weight) : null) : dog.weight,
      avatar: data.avatar ?? dog.avatar,
      bio: data.bio ?? dog.bio,
    },
  });

  return NextResponse.json(updated);
}
