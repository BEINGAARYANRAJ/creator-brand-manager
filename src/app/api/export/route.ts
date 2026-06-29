import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deals = await prisma.brandDeal.findMany({
    where: { userId },
    include: {
      invoices: true,
      deliverables: true,
      usageRights: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["Brand", "Platform", "Deal Value", "Currency", "Status", "Start Date", "End Date", "Total Invoiced", "Total Paid", "Deliverables", "Notes"],
    ...deals.map((d: any) => [
      d.brandName,
      d.platform,
      d.dealValue,
      d.currency,
      d.status,
      d.startDate ? new Date(d.startDate).toLocaleDateString() : "",
      d.endDate ? new Date(d.endDate).toLocaleDateString() : "",
      d.invoices.reduce((s: number, i: any) => s + i.amount, 0),
      d.invoices.filter((i: any) => i.status === "PAID").reduce((s: number, i: any) => s + i.amount, 0),
      d.deliverables.length,
      d.notes || "",
    ]),
  ];

  const csv = rows.map((r: any[]) => r.map((v: any) => `"${v}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="branddesk-export-${Date.now()}.csv"`,
    },
  });
}