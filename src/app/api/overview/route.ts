import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [deals, deliverables, invoices] = await Promise.all([
    prisma.brandDeal.findMany({ where: { userId } }),
    prisma.deliverable.findMany({
      where: { deal: { userId } },
      include: { deal: { select: { brandName: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.invoice.findMany({ where: { deal: { userId } } }),
  ]);

  const totalRevenue = invoices
    .filter((i: any) => i.status === "PAID")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const pendingRevenue = invoices
    .filter((i: any) => i.status === "UNPAID")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const upcomingDeadlines = deliverables
    .filter((d: any) => d.status !== "COMPLETED" && d.dueDate)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      totalDeals: deals.length,
      activeDeals: deals.filter((d: any) => d.status === "ACTIVE").length,
      totalRevenue,
      pendingRevenue,
      completedDeals: deals.filter((d: any) => d.status === "COMPLETED").length,
      pendingDeliverables: deliverables.filter((d: any) => d.status === "PENDING" || d.status === "IN_PROGRESS").length,
    },
    upcomingDeadlines,
  });
}