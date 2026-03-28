import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creatorId = (session.user as any).id;

  const [templates, purchases] = await Promise.all([
    prisma.template.findMany({
      where: { creatorId },
      include: { category: { select: { name: true } }, _count: { select: { purchases: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { template: { creatorId } },
      include: { template: { select: { title: true, price: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalEarnings = purchases.reduce((sum, p) => sum + p.amount * 0.8, 0); // 80% payout
  const totalSales = purchases.length;

  return NextResponse.json({ templates, purchases, totalEarnings, totalSales });
}
