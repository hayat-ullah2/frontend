import { env } from "../../config/env.js";

type Recipient = { email: string; name?: string; leadMagnet?: string };

export type SequenceStep = {
  /** Hours after signup this step should send. Step 0 = immediately. */
  delayHours: number;
  render: (r: Recipient, siteUrl: string) => { subject: string; html: string };
};

const BRAND = "Nexversal";
const UTM = "utm_source=newsletter&utm_medium=email&utm_campaign=welcome";

function link(siteUrl: string, path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${siteUrl}${path}${sep}${UTM}`;
}

/** Minimal, email-client-safe HTML shell with a compliant unsubscribe footer. */
function layout(siteUrl: string, email: string, bodyHtml: string): string {
  const unsub = `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!doctype html><html><body style="margin:0;background:#f4f4f7;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a22">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e6ee">
    <div style="padding:22px 28px;border-bottom:1px solid #eeeef4">
      <span style="font-weight:800;font-size:18px;letter-spacing:-.3px">
        <span style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);-webkit-background-clip:text;background-clip:text;color:#7c5cff">Nex</span>versal
      </span>
    </div>
    <div style="padding:28px">${bodyHtml}</div>
    <div style="padding:18px 28px;border-top:1px solid #eeeef4;color:#8a8a95;font-size:12px;line-height:1.6">
      You're receiving this because you subscribed at ${siteUrl.replace(/^https?:\/\//, "")}.<br>
      <a href="${unsub}" style="color:#8a8a95">Unsubscribe</a> · <a href="${link(siteUrl, "/")}" style="color:#8a8a95">Visit ${BRAND}</a>
    </div>
  </div>
</body></html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:10px;font-size:14px">${label} →</a>`;
}

const hi = (r: Recipient) => (r.name ? `Hi ${r.name.split(" ")[0]},` : "Hi there,");

export const WELCOME_STEPS: SequenceStep[] = [
  // 0 — immediate welcome + lead-magnet delivery
  {
    delayHours: 0,
    render: (r, siteUrl) => {
      const resource = r.leadMagnet
        ? link(siteUrl, `/resources/${r.leadMagnet}`)
        : link(siteUrl, "/blog");
      const magnetBlock = r.leadMagnet
        ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.7">Here's what you signed up for — grab it below:</p>${btn(resource, "Get your free resource")}`
        : `<p style="margin:0 0 18px;font-size:15px;line-height:1.7">Start with our most useful pieces:</p>${btn(link(siteUrl, "/blog"), "Browse the best articles")}`;
      return {
        subject: `Welcome to ${BRAND} 👋`,
        html: layout(
          siteUrl,
          r.email,
          `<h1 style="margin:0 0 12px;font-size:22px;letter-spacing:-.4px">${hi(r)} welcome aboard.</h1>
           <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#42424c">Thanks for subscribing. We publish honest, practical writing on AI &amp; developer tools — no fluff, no hype.</p>
           ${magnetBlock}
           <p style="margin:22px 0 0;font-size:14px;color:#6a6a75">More soon. Just reply if you ever have a question — a human reads it.</p>`,
        ),
      };
    },
  },
  // 1 — day 2, where to start
  {
    delayHours: 48,
    render: (r, siteUrl) => ({
      subject: "Where to start on Nexversal",
      html: layout(
        siteUrl,
        r.email,
        `<h1 style="margin:0 0 12px;font-size:20px">${hi(r)}</h1>
         <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#42424c">A quick follow-up. If you're choosing tools right now, our comparison guides are the fastest way to decide without testing ten apps yourself.</p>
         ${btn(link(siteUrl, "/blog"), "See the comparison guides")}`,
      ),
    }),
  },
  // 2 — day 5, recommended tools
  {
    delayHours: 120,
    render: (r, siteUrl) => ({
      subject: "The tools we actually recommend",
      html: layout(
        siteUrl,
        r.email,
        `<h1 style="margin:0 0 12px;font-size:20px">${hi(r)}</h1>
         <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#42424c">We only recommend tools we'd use ourselves — with honest pros, cons and pricing. Some links are affiliate links, at no extra cost to you.</p>
         ${btn(link(siteUrl, "/blog"), "Read the latest picks")}`,
      ),
    }),
  },
  // 3 — day 9, soft close
  {
    delayHours: 216,
    render: (r, siteUrl) => ({
      subject: "One thing before we go quiet",
      html: layout(
        siteUrl,
        r.email,
        `<h1 style="margin:0 0 12px;font-size:20px">${hi(r)}</h1>
         <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#42424c">That's the end of the welcome series — from here you'll just get our regular pieces when they're worth your time. Bookmark the blog so you never miss one.</p>
         ${btn(link(siteUrl, "/blog"), "Explore Nexversal")}`,
      ),
    }),
  },
];

export function siteUrl(): string {
  return env.frontendUrl.replace(/\/$/, "");
}
