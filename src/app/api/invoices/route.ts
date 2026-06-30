import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ invoices: [] });

  const invoices = await prisma.invoice.findMany({
    where: {
      dealId: dealId || undefined,
      deal: { userId: user.id },
    },
    include: { deal: { select: { brandName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { dealId, amount, currency, dueDate, notes } = body;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deal = await prisma.brandDeal.findFirst({
    where: { id: dealId, userId: user.id },
  });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const invoice = await prisma.invoice.create({
    data: {
      dealId,
      amount: parseFloat(amount),
      currency: currency || "USD",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoice = await prisma.invoice.updateMany({
    where: { id, deal: { userId: user.id } },
    data: {
      ...data,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      paidAt: data.status === "PAID" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ invoice });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.invoice.deleteMany({
    where: { id: id!, deal: { userId: user.id } },
  });

  return NextResponse.json({ success: true });
}