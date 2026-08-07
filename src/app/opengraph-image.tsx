import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0f0f0f 0%, #1a1033 50%, #0f1f3a 100%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -140,
            width: 480,
            height: 480,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -140,
            width: 480,
            height: 480,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
            width: "100%",
            height: "100%",
            padding: 80,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            N
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 100,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Long-form essays on technology, AI, business & the ideas shaping the next decade
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
