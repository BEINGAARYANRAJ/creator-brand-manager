import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [deals, invoices] = await Promise.all([
    prisma.brandDeal.findMany({ where: { userId } }),
    prisma.invoice.findMany({
      where: { deal: { userId } },
      include: { deal: { select: { brandName: true, platform: true } } },
    }),
  ]);

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  invoices.filter((i: any) => i.status === "PAID").forEach((inv: any) => {
    const month = new Date(inv.paidAt || inv.createdAt).toLocaleString("default", { month: "short", year: "2-digit" });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + inv.amount;
  });

  // Revenue by platform
  const revenueByPlatform: Record<string, number> = {};
  invoices.filter((i: any) => i.status === "PAID").forEach((inv: any) => {
    const p = inv.deal.platform;
    revenueByPlatform[p] = (revenueByPlatform[p] || 0) + inv.amount;
  });

  // Deals by status
  const dealsByStatus = [
    { name: "Negotiating", value: deals.filter((d: any) => d.status === "NEGOTIATING").length },
    { name: "Active", value: deals.filter((d: any) => d.status === "ACTIVE").length },
    { name: "Completed", value: deals.filter((d: any) => d.status === "COMPLETED").length },
    { name: "Cancelled", value: deals.filter((d: any) => d.status === "CANCELLED").length },
  ].filter((d: any) => d.value > 0);

  return NextResponse.json({
    revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
    revenueByPlatform: Object.entries(revenueByPlatform).map(([platform, revenue]) => ({ platform, revenue })),
    dealsByStatus,
    topBrands: invoices
     .filter((i: any) => i.status === "PAID")
     .reduce((acc: any[], inv: any) => {
       const existing = acc.find((b: any) => b.brand === inv.deal.brandName);
       if (existing) existing.revenue += inv.amount;
       else acc.push({ brand: inv.deal.brandName, revenue: inv.amount });
       return acc;
      }, [])
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5),
  });
}