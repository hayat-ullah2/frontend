import { ImageResponse } from "next/og";
import { apiPublicSafe } from "@/lib/apiServer";
import type { ApiPost } from "@/lib/models";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "Article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OG image. If the post has a cover, we embed it as a background;
 * otherwise we render a branded gradient with the title + site name.
 * Google, Facebook and Twitter fetch this URL at share time.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await apiPublicSafe<ApiPost | null>(`/posts/${slug}`, null);

  const title = post?.title ?? "Article not found";
  const category = post?.category?.name;
  const cover = post?.cover;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            cover
              ? "#0f0f0f"
              : "linear-gradient(135deg, #0f0f0f 0%, #1a1033 50%, #0f1f3a 100%)",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#fff",
        }}
      >
        {cover && (
          // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
          <img
            src={cover}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}
        {/* radial highlights */}
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
            justifyContent: "space-between",
            padding: "70px 80px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              N
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>
              {SITE_NAME}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {category && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {category}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontSize: title.length > 60 ? 54 : 66,
                lineHeight: 1.1,
                fontWeight: 800,
                letterSpacing: -1.5,
                color: "#fff",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "rgba(255,255,255,0.6)",
              fontSize: 22,
            }}
          >
            <span>{post?.author?.name ?? SITE_NAME}</span>
            <span>Read on {SITE_NAME}</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
