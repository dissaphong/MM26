import nodemailer, { type Transporter } from "nodemailer";

// Email sender with three modes, tried in order:
//   1. Resend HTTP API  — if RESEND_API_KEY is set (recommended on Vercel/serverless).
//   2. SMTP             — if SMTP_HOST is set (Mailpit locally, or any SMTP provider).
//   3. Console          — otherwise, pretty-print to the terminal (zero-setup dev).

type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const FROM = process.env.MAIL_FROM ?? "MM26 <onboarding@resend.dev>";

// --- 1. Resend HTTP API (no SDK needed) ---
async function sendViaResend(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });

  if (!res.ok) {
    // Surface the real reason (e.g. "you can only send to your own email
    // until you verify a domain") instead of failing silently.
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${detail}`);
  }
  return true;
}

// --- 2. SMTP ---
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

// --- 3. Console ---
function logToConsole(mail: Mail) {
  const divider = "─".repeat(60);
  console.log(`\n${divider}\n📧  Email (dev console transport)`);
  console.log(`From:    ${FROM}`);
  console.log(`To:      ${mail.to}`);
  console.log(`Subject: ${mail.subject}`);
  console.log(divider);
  console.log(mail.text);
  console.log(`${divider}\n`);
}

export async function sendMail(mail: Mail): Promise<void> {
  // 1. Resend HTTP API
  if (await sendViaResend(mail)) return;

  // 2. SMTP
  const t = getTransporter();
  if (t) {
    await t.sendMail({
      from: FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return;
  }

  // 3. Console fallback
  logToConsole(mail);
}
