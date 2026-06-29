import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ results: [] });

  const [deals, deliverables] = await Promise.all([
    prisma.brandDeal.findMany({
      where: {
        userId: user.id,
        OR: [
          { brandName: { contains: q, mode: "insensitive" } },
          { platform: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.deliverable.findMany({
      where: {
        deal: { userId: user.id },
        title: { contains: q, mode: "insensitive" },
      },
      include: { deal: { select: { brandName: true } } },
      take: 5,
    }),
  ]);

  const results = [
    ...deals.map((d) => ({
      type: "deal",
      id: d.id,
      title: d.brandName,
      subtitle: `${d.platform} · $${d.dealValue} · ${d.status}`,
      href: `/dashboard/deals/${d.id}`,
    })),
    ...deliverables.map((d) => ({
      type: "deliverable",
      id: d.id,
      title: d.title,
      subtitle: `Deliverable · ${d.deal?.brandName} · ${d.status}`,
      href: `/dashboard/deliverables`,
    })),
  ];

  return NextResponse.json({ results });
}