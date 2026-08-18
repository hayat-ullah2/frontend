import Image from "next/image";
import Link from "next/link";
import type { ApiPost } from "@/lib/models";
import { VIEWS_DISPLAY_THRESHOLD } from "@/lib/site";
import { Clock, Eye } from "../Icon";

type Variant = "default" | "compact" | "horizontal";

export default function ArticleCard({
  post,
  variant = "default",
  priority = false,
}: {
  post: ApiPost;
  variant?: Variant;
  priority?: boolean;
}) {
  const cover = post.cover ?? "/placeholder.png";
  const category = post.category;

  if (variant === "horizontal") {
    return (
      <Link href={`/blog/${post.slug}`} className="card group flex gap-4 p-3 overflow-hidden">
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="120px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="min-w-0 flex flex-col justify-between py-1">
          <div>
            {category && (
              <span className="text-[11px] uppercase tracking-wider text-foreground-subtle">
                {category.name}
              </span>
            )}
            <h3 className="text-sm font-semibold leading-snug mt-1 line-clamp-2 group-hover:text-gradient-accent">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-foreground-subtle">
            {post.readingTime >= 1 && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {post.readingTime}m
              </span>
            )}
            {post.views >= VIEWS_DISPLAY_THRESHOLD && (
              <span className="flex items-center gap-1">
                <Eye size={12} /> {formatNum(post.views)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.slug}`} className="card group block overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={cover}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {category && (
            <span className="absolute top-3 left-3 chip-accent text-[11px]">{category.name}</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-gradient-accent">
            {post.title}
          </h3>
          <div className="mt-3 flex items-center justify-end text-xs text-foreground-subtle">
            {post.readingTime >= 1 && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {post.readingTime}m
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="card group block overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={cover}
          alt={post.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {category && (
          <span className="absolute top-4 left-4 chip-accent text-[11px]">
            {category.name}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-gradient-accent transition">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-foreground-muted line-clamp-2">{post.excerpt}</p>
        <div className="mt-5 flex items-center justify-end">
          <div className="flex items-center gap-3 text-xs text-foreground-subtle">
            {post.readingTime >= 1 && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {post.readingTime}m
              </span>
            )}
            {post.views >= VIEWS_DISPLAY_THRESHOLD && (
              <span className="flex items-center gap-1">
                <Eye size={12} /> {formatNum(post.views)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}
