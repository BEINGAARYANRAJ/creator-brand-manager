import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");

  const deliverables = await prisma.deliverable.findMany({
    where: {
      ...(dealId ? { dealId } : {}),
      deal: { userId },
    },
    include: { deal: { select: { brandName: true } } },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ deliverables });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dealId, title, type, dueDate, notes } = body;

  const deal = await prisma.brandDeal.findFirst({
    where: { id: dealId, userId },
  });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const deliverable = await prisma.deliverable.create({
    data: {
      dealId,
      title,
      type,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      notes,
    },
  });

  return NextResponse.json({ deliverable }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  const deliverable = await prisma.deliverable.updateMany({
    where: { id, deal: { userId } },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  return NextResponse.json({ deliverable });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await prisma.deliverable.deleteMany({
    where: { id: id!, deal: { userId } },
  });

  return NextResponse.json({ success: true });
}