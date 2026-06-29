import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usageRights = await prisma.usageRight.findMany({
    where: { deal: { userId } },
    include: { deal: { select: { brandName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ usageRights });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dealId, platform, duration, exclusivity, expiresAt, notes } = body;

  const deal = await prisma.brandDeal.findFirst({ where: { id: dealId, userId } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const usageRight = await prisma.usageRight.create({
    data: {
      dealId, platform, duration,
      exclusivity: exclusivity || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      notes,
    },
  });

  return NextResponse.json({ usageRight }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await prisma.usageRight.deleteMany({ where: { id: id!, deal: { userId } } });

  return NextResponse.json({ success: true });
}