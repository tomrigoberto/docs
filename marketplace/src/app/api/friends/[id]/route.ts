import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Accept or decline a friend request (parent permission)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { status } = await req.json();

  if (!["ACCEPTED", "DECLINED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get the request and verify the toDog belongs to the user
  const request = await prisma.friendRequest.findUnique({
    where: { id: params.id },
    include: { toDog: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.toDog.ownerId !== userId) {
    return NextResponse.json({ error: "Only the dog's parent can respond" }, { status: 403 });
  }

  const updated = await prisma.friendRequest.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
