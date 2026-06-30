import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ deliverables: [] });

  const deliverables = await prisma.deliverable.findMany({
    where: {
      ...(dealId ? { dealId } : {}),
      deal: { userId: user.id },
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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deal = await prisma.brandDeal.findFirst({
    where: { id: dealId, userId: user.id },
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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deliverable = await prisma.deliverable.updateMany({
    where: { id, deal: { userId: user.id } },
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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deliverable.deleteMany({
    where: { id: id!, deal: { userId: user.id } },
  });
  return NextResponse.json({ success: true });
}