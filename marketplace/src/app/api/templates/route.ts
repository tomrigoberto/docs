import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.template.findMany({
    where: { published: true },
    include: {
      creator: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { downloads: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, longDesc, price, format, categoryId } = body;

  if (!title || !description || !price || !format || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const template = await prisma.template.create({
    data: {
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      longDesc,
      price: parseFloat(price),
      format,
      categoryId,
      creatorId: (session.user as any).id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
