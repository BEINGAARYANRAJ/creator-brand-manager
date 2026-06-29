import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDeliverableReminders() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const today = new Date();

  const upcoming = await prisma.deliverable.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lte: threeDaysFromNow, gte: today },
      lastReminderSentAt: null,
    },
    include: { deal: true },
  });

  for (const d of upcoming) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.REMINDER_EMAIL!,
        subject: `⏰ Deliverable Due Soon: ${d.title}`,
        html: `
          <h2>Deliverable Reminder</h2>
          <p><strong>${d.title}</strong> for <strong>${d.deal.brandName}</strong> is due on ${d.dueDate?.toLocaleDateString()}.</p>
          <p>Status: ${d.status}</p>
          <p>Log in to BrandDesk to update your progress.</p>
        `,
      });

      await prisma.deliverable.update({
        where: { id: d.id },
        data: { lastReminderSentAt: new Date() },
      });
    } catch (err) {
      console.error("Failed to send deliverable reminder:", err);
    }
  }
}

export async function sendInvoiceReminders() {
  const today = new Date();

  const overdue = await prisma.invoice.findMany({
    where: {
      status: "UNPAID",
      dueDate: { lt: today },
      lastReminderSentAt: null,
    },
    include: { deal: true },
  });

  for (const inv of overdue) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.REMINDER_EMAIL!,
        subject: `🔴 Overdue Invoice: ${inv.deal.brandName}`,
        html: `
          <h2>Invoice Overdue</h2>
          <p>Invoice of <strong>$${inv.amount} ${inv.currency}</strong> from <strong>${inv.deal.brandName}</strong> was due on ${inv.dueDate?.toLocaleDateString()}.</p>
          <p>Log in to BrandDesk to follow up.</p>
        `,
      });

      await prisma.invoice.update({
        where: { id: inv.id },
        data: { lastReminderSentAt: new Date() },
      });
    } catch (err) {
      console.error("Failed to send invoice reminder:", err);
    }
  }
}