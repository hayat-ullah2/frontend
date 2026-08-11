import { env } from "../../config/env.js";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailResult = {
  ok: boolean;
  provider: "resend" | "log";
  id?: string;
  error?: string;
};

/** True when a real delivery provider is configured. */
export function isEmailConfigured(): boolean {
  return !!env.email.resendApiKey;
}

/**
 * Provider-agnostic send. Uses Resend's HTTP API when a key is present
 * (no SDK dependency — just fetch), otherwise logs the email so the welcome
 * sequence is fully testable before you connect a provider. Never throws.
 */
export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  if (!env.email.resendApiKey) {
    console.log(
      `[email:log] → ${msg.to} · "${msg.subject}" (no provider configured; not sent)`,
    );
    return { ok: true, provider: "log" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.email.from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text ?? stripHtml(msg.html),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) {
      console.warn(`[email:resend] failed for ${msg.to}: ${data.message ?? res.statusText}`);
      return { ok: false, provider: "resend", error: data.message ?? res.statusText };
    }
    return { ok: true, provider: "resend", id: data.id };
  } catch (err) {
    console.warn(`[email:resend] error for ${msg.to}:`, (err as Error).message);
    return { ok: false, provider: "resend", error: (err as Error).message };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
