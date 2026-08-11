// Authorized Digital Sellers (ads.txt). Ad networks read this at the domain
// root to confirm you're allowed to sell your inventory — it protects your
// revenue from spoofing. Populated automatically from the AdSense publisher id.

export const dynamic = "force-static";
export const revalidate = 86400; // a day is plenty; it rarely changes

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // e.g. ca-pub-123…
  const pub = client?.replace(/^ca-/, ""); // → pub-123…

  const lines: string[] = [];
  if (pub) {
    // Google AdSense line. Add more networks (Ezoic, Mediavine, etc.) here
    // once you're accepted by them.
    lines.push(`google.com, ${pub}, DIRECT, f08c47fec0942fa0`);
  } else {
    lines.push("# No ad network configured yet.");
    lines.push("# Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. ca-pub-XXXX) to publish your AdSense line.");
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
