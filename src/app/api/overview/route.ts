import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatCurrency(amounts: Record<string, number>) {
  return Object.entries(amounts)
    .map(([currency, amount]) => {
      const symbol = currency === "INR" ? "₹" : "$";
      return `${symbol}${amount.toLocaleString()} ${currency}`;
    })
    .join(" + ");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [deals, deliverables, invoices] = await Promise.all([
    prisma.brandDeal.findMany({ where: { userId: user.id } }),
    prisma.deliverable.findMany({
      where: { deal: { userId: user.id } },
      include: { deal: { select: { brandName: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.invoice.findMany({ where: { deal: { userId: user.id } } }),
  ]);

  const revenueByC: Record<string, number> = {};
  const pendingByC: Record<string, number> = {};

  invoices.filter(i => i.status === "PAID").forEach(i => {
    revenueByC[i.currency] = (revenueByC[i.currency] || 0) + i.amount;
  });
  invoices.filter(i => i.status === "UNPAID").forEach(i => {
    pendingByC[i.currency] = (pendingByC[i.currency] || 0) + i.amount;
  });

  const upcomingDeadlines = deliverables
    .filter(d => d.status !== "COMPLETED" && d.dueDate)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      totalDeals: deals.length,
      activeDeals: deals.filter(d => d.status === "ACTIVE").length,
      totalRevenue: formatCurrency(revenueByC) || "$0",
      pendingRevenue: formatCurrency(pendingByC) || "$0",
      completedDeals: deals.filter(d => d.status === "COMPLETED").length,
      pendingDeliverables: deliverables.filter(d => d.status === "PENDING" || d.status === "IN_PROGRESS").length,
    },
    upcomingDeadlines,
  });
}