import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/site/ArticleCard";
import {
  Eye,
  FileText,
  Github,
  Globe,
  Heart,
  Linkedin,
  Twitter,
  Users,
} from "@/components/Icon";
import { authors, getAuthorBySlug, getPostsByAuthor } from "@/lib/data";

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  props: PageProps<"/author/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const a = getAuthorBySlug(slug);
  return {
    title: a ? `${a.name} — ${a.role}` : "Author",
    description: a?.bio,
  };
}

export default async function AuthorPage(props: PageProps<"/author/[slug]">) {
  const { slug } = await props.params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const authorPosts = getPostsByAuthor(slug);
  const totalLikes = authorPosts.reduce((s, p) => s + p.likes, 0);

  return (
    <div className="pb-20">
      {/* Cover */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <Image src={author.cover} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative">
        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-white/10">
            <Image src={author.avatar} alt={author.name} fill sizes="120px" className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-foreground-subtle uppercase tracking-wider">
              {author.role}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              {author.name}
            </h1>
            <p className="mt-3 text-foreground-muted max-w-2xl">{author.bio}</p>
            <div className="mt-5 flex items-center gap-2">
              {author.twitter && (
                <a className="btn-ghost p-2" href="#" aria-label="Twitter">
                  <Twitter size={14} />
                </a>
              )}
              {author.github && (
                <a className="btn-ghost p-2" href="#" aria-label="GitHub">
                  <Github size={14} />
                </a>
              )}
              {author.linkedin && (
                <a className="btn-ghost p-2" href="#" aria-label="LinkedIn">
                  <Linkedin size={14} />
                </a>
              )}
              {author.website && (
                <a className="btn-ghost p-2" href="#" aria-label="Website">
                  <Globe size={14} />
                </a>
              )}
              <button className="ml-auto btn-primary text-sm">Follow</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mt-6">
          <StatCard label="Published" value={author.postsCount.toString()} icon={<FileText size={16} />} />
          <StatCard label="Followers" value={`${(author.followers / 1000).toFixed(1)}k`} icon={<Users size={16} />} />
          <StatCard label="Total views" value={`${(author.views / 1000).toFixed(0)}k`} icon={<Eye size={16} />} />
          <StatCard label="Total likes" value={totalLikes.toString()} icon={<Heart size={16} />} />
        </div>

        {/* Posts */}
        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Articles by {author.name.split(" ")[0]}</h2>
            <Link href="/blog" className="text-sm text-foreground-muted hover:text-foreground">
              All articles
            </Link>
          </div>

          {authorPosts.length === 0 ? (
            <div className="card mt-6 p-10 text-center text-foreground-subtle">
              No published articles yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {authorPosts.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
        <span className="text-foreground-subtle">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
