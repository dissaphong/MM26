import nodemailer, { type Transporter } from "nodemailer";

// Email sender. Two modes:
//   - SMTP: if SMTP_HOST is set, send via nodemailer (Mailpit/Mailtrap/Resend SMTP/etc).
//   - Console: otherwise, pretty-print emails to the terminal so dev works with zero setup.

type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let cachedTransporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return cachedTransporter;
}

const FROM = process.env.MAIL_FROM ?? "MM26 <noreply@mm26.local>";

export async function sendMail(mail: Mail): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // Dev fallback — render the email in the terminal so devs see it.
    const divider = "─".repeat(60);
    console.log(`\n${divider}\n📧  Email (dev console transport)`);
    console.log(`From:    ${FROM}`);
    console.log(`To:      ${mail.to}`);
    console.log(`Subject: ${mail.subject}`);
    console.log(divider);
    console.log(mail.text);
    console.log(`${divider}\n`);
    return;
  }
  await t.sendMail({
    from: FROM,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
