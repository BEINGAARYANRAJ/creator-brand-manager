import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your_key_here") {
    return NextResponse.json({ success: false, message: "Resend not configured" });
  }

  const { sendDeliverableReminders, sendInvoiceReminders } = await import("@/lib/reminders");
  await sendDeliverableReminders();
  await sendInvoiceReminders();

  return NextResponse.json({ success: true, ran: new Date().toISOString() });
}