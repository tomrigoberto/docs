import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const userId = (session.user as any).id;

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const dogs = await prisma.dog.findMany({
    where: {
      AND: [
        { ownerId: { not: userId } },
        {
          OR: [
            { name: { contains: q } },
            { breed: { contains: q } },
          ],
        },
      ],
    },
    include: { owner: { select: { name: true } } },
    take: 20,
  });

  return NextResponse.json(dogs);
}
