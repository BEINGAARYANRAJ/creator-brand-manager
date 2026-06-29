import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ deals: [] });

  const deals = await prisma.brandDeal.findMany({
    where: { userId: user.id },
    include: {
      deliverables: true,
      invoices: true,
      usageRights: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ deals });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { brandName, platform, dealValue, currency, startDate, endDate, notes } = body;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId: userId, email: body.email || "", name: body.name || "" },
    });
  }

  const deal = await prisma.brandDeal.create({
    data: {
      userId: user.id,
      brandName,
      platform,
      dealValue: parseFloat(dealValue),
      currency: currency || "USD",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      notes,
    },
  });

  return NextResponse.json({ deal }, { status: 201 });
}