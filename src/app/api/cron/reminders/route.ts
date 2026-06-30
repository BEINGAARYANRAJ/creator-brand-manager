import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingDeliverables = await prisma.deliverable.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lte: in3Days, gte: now },
    },
    include: { deal: true },
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "UNPAID",
      dueDate: { lt: now },
    },
    include: { deal: true },
  });

  if (upcomingDeliverables.length === 0 && overdueInvoices.length === 0) {
    return NextResponse.json({ message: "No reminders needed" });
  }

  const deliverableRows = upcomingDeliverables
    .map(d => `<li>${d.title} (${d.deal.brandName}) — due ${new Date(d.dueDate!).toLocaleDateString()}</li>`)
    .join("");

  const invoiceRows = overdueInvoices
    .map(i => `<li>${i.deal.brandName} — ${i.currency} ${i.amount} — was due ${new Date(i.dueDate!).toLocaleDateString()}</li>`)
    .join("");

  const html = `
    <h2>BrandDesk Reminders</h2>
    ${upcomingDeliverables.length > 0 ? `<h3>Upcoming Deliverables</h3><ul>${deliverableRows}</ul>` : ""}
    ${overdueInvoices.length > 0 ? `<h3>Overdue Invoices</h3><ul>${invoiceRows}</ul>` : ""}
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.REMINDER_EMAIL!,
    subject: "BrandDesk: Deadline & Payment Reminders",
    html,
  });

  return NextResponse.json({
    sent: true,
    deliverables: upcomingDeliverables.length,
    invoices: overdueInvoices.length,
  });
}