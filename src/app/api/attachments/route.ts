import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ attachments: [] });

  const attachments = await prisma.dealAttachment.findMany({
    where: { dealId, deal: { userId: user.id } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ attachments });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const dealId = formData.get("dealId") as string;

  if (!file || !dealId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const deal = await prisma.brandDeal.findFirst({ where: { id: dealId, userId: user.id } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const blob = await put(`attachments/${dealId}/${file.name}`, file, { access: "public" });

  const attachment = await prisma.dealAttachment.create({
    data: {
      dealId,
      fileName: file.name,
      fileUrl: blob.url,
      fileSize: file.size,
    },
  });

  return NextResponse.json({ attachment }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const fileUrl = searchParams.get("fileUrl");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (fileUrl) await del(fileUrl);

  await prisma.dealAttachment.deleteMany({
    where: { id: id!, deal: { userId: user.id } },
  });

  return NextResponse.json({ success: true });
}