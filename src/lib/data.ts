import type { Author, Category, Comment, Post, Tag } from "./types";

export const categories: Category[] = [
  { slug: "technology", name: "Technology", description: "Hardware, gadgets, and the cutting edge of consumer tech.", color: "from-blue-500 to-cyan-400", icon: "cpu", postCount: 42 },
  { slug: "ai", name: "Artificial Intelligence", description: "LLMs, agents, ML research and applied AI.", color: "from-purple-500 to-fuchsia-500", icon: "sparkles", postCount: 38 },
  { slug: "programming", name: "Programming", description: "Languages, frameworks, patterns and craft.", color: "from-emerald-500 to-teal-400", icon: "code", postCount: 56 },
  { slug: "cybersecurity", name: "Cybersecurity", description: "Threats, defenses, audits and policy.", color: "from-red-500 to-rose-400", icon: "shield", postCount: 21 },
  { slug: "business", name: "Business", description: "Strategy, leadership and the startup grind.", color: "from-amber-500 to-orange-400", icon: "briefcase", postCount: 19 },
  { slug: "finance", name: "Finance", description: "Markets, investing and personal finance.", color: "from-yellow-500 to-amber-400", icon: "chart", postCount: 14 },
  { slug: "health", name: "Health & Fitness", description: "Performance, nutrition, sleep and longevity.", color: "from-lime-500 to-green-400", icon: "heart", postCount: 17 },
  { slug: "education", name: "Education", description: "Learning, curricula and skill development.", color: "from-indigo-500 to-blue-400", icon: "book", postCount: 12 },
  { slug: "travel", name: "Travel", description: "Destinations, guides and travel tech.", color: "from-sky-500 to-cyan-400", icon: "map", postCount: 9 },
  { slug: "lifestyle", name: "Lifestyle", description: "Habits, productivity, and design for living.", color: "from-pink-500 to-rose-400", icon: "spark", postCount: 11 },
  { slug: "sports", name: "Sports", description: "Analysis, athletes, and the science of sport.", color: "from-orange-500 to-red-400", icon: "trophy", postCount: 8 },
  { slug: "motivation", name: "Motivation", description: "Mindset, focus, and the long game.", color: "from-fuchsia-500 to-pink-400", icon: "flame", postCount: 7 },
  { slug: "crypto", name: "Crypto", description: "Web3, DeFi, on-chain analysis.", color: "from-violet-500 to-purple-400", icon: "coin", postCount: 13 },
  { slug: "marketing", name: "Digital Marketing", description: "SEO, growth and content strategy.", color: "from-teal-500 to-emerald-400", icon: "megaphone", postCount: 15 },
];

export const tags: Tag[] = [
  { slug: "nextjs", name: "Next.js", postCount: 22 },
  { slug: "react", name: "React", postCount: 31 },
  { slug: "typescript", name: "TypeScript", postCount: 24 },
  { slug: "tailwind", name: "Tailwind CSS", postCount: 17 },
  { slug: "node", name: "Node.js", postCount: 12 },
  { slug: "llm", name: "LLM", postCount: 18 },
  { slug: "agents", name: "Agents", postCount: 10 },
  { slug: "rust", name: "Rust", postCount: 9 },
  { slug: "python", name: "Python", postCount: 16 },
  { slug: "devops", name: "DevOps", postCount: 11 },
  { slug: "career", name: "Career", postCount: 7 },
  { slug: "design", name: "Design", postCount: 13 },
  { slug: "seo", name: "SEO", postCount: 8 },
  { slug: "startups", name: "Startups", postCount: 9 },
  { slug: "investing", name: "Investing", postCount: 6 },
];

export const authors: Author[] = [
  {
    slug: "alex-rivera",
    name: "Alex Rivera",
    role: "Senior Engineer",
    bio: "Building developer tools at scale. Previously at Vercel and Stripe. Writes about distributed systems, edge compute, and team craft.",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
    twitter: "alexrivera",
    github: "alexrivera",
    linkedin: "alex-rivera",
    website: "https://alexrivera.dev",
    postsCount: 42,
    followers: 12400,
    views: 482000,
  },
  {
    slug: "priya-shah",
    name: "Priya Shah",
    role: "AI Researcher",
    bio: "Researching alignment and post-training. Previously at DeepMind. Publishes deep dives on LLM capabilities and agentic systems.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&q=80&auto=format&fit=crop",
    twitter: "priyashah",
    github: "priyashah",
    postsCount: 28,
    followers: 22800,
    views: 711000,
  },
  {
    slug: "marcus-chen",
    name: "Marcus Chen",
    role: "Security Lead",
    bio: "Red team operator turned writer. Breaking down recent incidents, supply-chain risk, and detection engineering.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1600&q=80&auto=format&fit=crop",
    twitter: "marcuschen",
    github: "marcuschen",
    postsCount: 19,
    followers: 8400,
    views: 196000,
  },
  {
    slug: "lena-fischer",
    name: "Lena Fischer",
    role: "Editor in Chief",
    bio: "Long-form storyteller covering startups, finance and the business of building. Former newsroom lead at TechCrunch.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&auto=format&fit=crop",
    twitter: "lenafischer",
    linkedin: "lena-fischer",
    postsCount: 51,
    followers: 18700,
    views: 533000,
  },
  {
    slug: "jamal-osei",
    name: "Jamal Osei",
    role: "Health & Performance",
    bio: "Sports scientist writing about strength, longevity and the practical side of health tech.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80&auto=format&fit=crop",
    twitter: "jamalosei",
    postsCount: 22,
    followers: 9600,
    views: 211000,
  },
  {
    slug: "sara-kowalski",
    name: "Sara Kowalski",
    role: "Travel & Lifestyle",
    bio: "Slow-travel correspondent. Writes city guides, remote-work setups and the design of everyday life.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&q=80&auto=format&fit=crop",
    cover: "https://images.unsplash.com/photo-1503264116251-35a269479413?w=1600&q=80&auto=format&fit=crop",
    twitter: "sarakowalski",
    postsCount: 36,
    followers: 14200,
    views: 388000,
  },
];

const cover = (id: string, q = 80) =>
  `https://images.unsplash.com/${id}?w=1600&q=${q}&auto=format&fit=crop`;

export const posts: Post[] = [
  {
    slug: "the-quiet-revolution-of-agentic-llms",
    title: "The quiet revolution of agentic LLMs",
    excerpt: "Why agents are graduating from demos to production — and what the next 12 months look like.",
    content: "",
    cover: cover("photo-1677442136019-21780ecad995"),
    category: "ai",
    tags: ["llm", "agents", "python"],
    authorSlug: "priya-shah",
    publishedAt: "2026-06-18",
    readingTime: 11,
    views: 28400,
    likes: 1820,
    comments: 142,
    featured: true,
    trending: true,
  },
  {
    slug: "building-resilient-edge-apis-with-nextjs",
    title: "Building resilient edge APIs with Next.js",
    excerpt: "Patterns for graceful degradation, caching strategy and observability at the edge.",
    content: "",
    cover: cover("photo-1517694712202-14dd9538aa97"),
    category: "programming",
    tags: ["nextjs", "typescript", "devops"],
    authorSlug: "alex-rivera",
    publishedAt: "2026-06-14",
    readingTime: 9,
    views: 18200,
    likes: 982,
    comments: 76,
    trending: true,
  },
  {
    slug: "the-anatomy-of-a-supply-chain-attack",
    title: "The anatomy of a supply chain attack",
    excerpt: "A breakdown of three real incidents and the defenses that would have caught them earlier.",
    content: "",
    cover: cover("photo-1550751827-4bd374c3f58b"),
    category: "cybersecurity",
    tags: ["devops"],
    authorSlug: "marcus-chen",
    publishedAt: "2026-06-12",
    readingTime: 14,
    views: 22100,
    likes: 1430,
    comments: 119,
    trending: true,
  },
  {
    slug: "why-pricing-is-strategy",
    title: "Why pricing is strategy, not a number",
    excerpt: "Pricing decisions encode positioning. Here's how the best teams treat pricing as a product surface.",
    content: "",
    cover: cover("photo-1551288049-bebda4e38f71"),
    category: "business",
    tags: ["startups", "career"],
    authorSlug: "lena-fischer",
    publishedAt: "2026-06-10",
    readingTime: 8,
    views: 15800,
    likes: 740,
    comments: 58,
  },
  {
    slug: "a-personal-finance-stack-for-2026",
    title: "A personal finance stack for 2026",
    excerpt: "The tools, accounts and routines that actually matter — and a few overrated ones.",
    content: "",
    cover: cover("photo-1554224155-6726b3ff858f"),
    category: "finance",
    tags: ["investing"],
    authorSlug: "lena-fischer",
    publishedAt: "2026-06-08",
    readingTime: 7,
    views: 9700,
    likes: 510,
    comments: 41,
  },
  {
    slug: "training-for-longevity-not-just-strength",
    title: "Training for longevity, not just strength",
    excerpt: "What the latest research says about preserving function into your 70s and 80s.",
    content: "",
    cover: cover("photo-1517836357463-d25dfeac3438"),
    category: "health",
    tags: [],
    authorSlug: "jamal-osei",
    publishedAt: "2026-06-06",
    readingTime: 10,
    views: 12300,
    likes: 880,
    comments: 64,
  },
  {
    slug: "why-rust-is-eating-systems-programming",
    title: "Why Rust is eating systems programming",
    excerpt: "From kernels to CDNs, Rust is quietly winning. The reasons are economic, not aesthetic.",
    content: "",
    cover: cover("photo-1555066931-4365d14bab8c"),
    category: "programming",
    tags: ["rust", "devops"],
    authorSlug: "alex-rivera",
    publishedAt: "2026-06-04",
    readingTime: 12,
    views: 21500,
    likes: 1320,
    comments: 198,
  },
  {
    slug: "the-traveler-s-remote-work-kit",
    title: "The traveler's remote work kit",
    excerpt: "A field-tested setup for working from anywhere, with no compromises on focus.",
    content: "",
    cover: cover("photo-1488646953014-85cb44e25828"),
    category: "travel",
    tags: ["design"],
    authorSlug: "sara-kowalski",
    publishedAt: "2026-06-02",
    readingTime: 6,
    views: 6800,
    likes: 290,
    comments: 22,
  },
  {
    slug: "designing-with-restraint",
    title: "Designing with restraint",
    excerpt: "The case for fewer features, smaller surfaces and clearer hierarchies.",
    content: "",
    cover: cover("photo-1545239351-1141bd82e8a6"),
    category: "lifestyle",
    tags: ["design"],
    authorSlug: "sara-kowalski",
    publishedAt: "2026-05-30",
    readingTime: 5,
    views: 5400,
    likes: 320,
    comments: 18,
  },
  {
    slug: "the-mental-game-of-marathons",
    title: "The mental game of marathons",
    excerpt: "Pacing, fueling and the psychology of the back half.",
    content: "",
    cover: cover("photo-1452626038306-9aae5e071dd3"),
    category: "sports",
    tags: [],
    authorSlug: "jamal-osei",
    publishedAt: "2026-05-28",
    readingTime: 8,
    views: 4700,
    likes: 210,
    comments: 14,
  },
  {
    slug: "you-don-t-need-motivation-you-need-structure",
    title: "You don't need motivation, you need structure",
    excerpt: "The reliable way to compound effort over years instead of weeks.",
    content: "",
    cover: cover("photo-1483450388369-9ed95738483c"),
    category: "motivation",
    tags: ["career"],
    authorSlug: "lena-fischer",
    publishedAt: "2026-05-26",
    readingTime: 6,
    views: 8200,
    likes: 540,
    comments: 33,
  },
  {
    slug: "stablecoins-quietly-ate-cross-border-payments",
    title: "Stablecoins quietly ate cross-border payments",
    excerpt: "The numbers behind the shift, and what it means for fintech in 2026.",
    content: "",
    cover: cover("photo-1518544866330-95a2bec01ee5"),
    category: "crypto",
    tags: ["investing"],
    authorSlug: "lena-fischer",
    publishedAt: "2026-05-24",
    readingTime: 9,
    views: 11900,
    likes: 670,
    comments: 88,
  },
  {
    slug: "seo-in-the-age-of-answer-engines",
    title: "SEO in the age of answer engines",
    excerpt: "How content strategy is changing when LLMs are the front page.",
    content: "",
    cover: cover("photo-1432888622747-4eb9a8efeb07"),
    category: "marketing",
    tags: ["seo"],
    authorSlug: "lena-fischer",
    publishedAt: "2026-05-22",
    readingTime: 8,
    views: 9200,
    likes: 480,
    comments: 41,
  },
  {
    slug: "the-self-taught-engineer-s-curriculum",
    title: "The self-taught engineer's curriculum",
    excerpt: "A practical path through the fundamentals, with no fluff.",
    content: "",
    cover: cover("photo-1503676260728-1c00da094a0b"),
    category: "education",
    tags: ["career", "python"],
    authorSlug: "alex-rivera",
    publishedAt: "2026-05-20",
    readingTime: 11,
    views: 14400,
    likes: 990,
    comments: 102,
  },
  {
    slug: "ten-tailwind-patterns-i-use-every-week",
    title: "Ten Tailwind patterns I use every week",
    excerpt: "Practical compositions that make components scan and scale.",
    content: "",
    cover: cover("photo-1545235617-9465d2a55698"),
    category: "programming",
    tags: ["tailwind", "react"],
    authorSlug: "alex-rivera",
    publishedAt: "2026-05-18",
    readingTime: 7,
    views: 12700,
    likes: 880,
    comments: 71,
  },
  {
    slug: "the-quiet-productivity-of-walking",
    title: "The quiet productivity of walking",
    excerpt: "How an old habit became my best thinking tool.",
    content: "",
    cover: cover("photo-1502082553048-f009c37129b9"),
    category: "lifestyle",
    tags: [],
    authorSlug: "sara-kowalski",
    publishedAt: "2026-05-16",
    readingTime: 5,
    views: 6300,
    likes: 410,
    comments: 24,
  },
];

// Long-form sample content used for every single-post page.
export const samplePostBody = `
<p>This is a sample article body rendered for the demo. In production, this content would be loaded from a CMS or markdown source and rendered through a sanitized HTML pipeline.</p>

<h2 id="introduction">Introduction</h2>
<p>The most interesting shifts in software rarely arrive with a press release. They show up as a quiet change in how teams build, ship, and reason about their work. Over the past year, the surface area of what a single engineer can do has expanded dramatically — and the ergonomics around that capability are finally catching up.</p>

<p>What follows is a working sketch of that shift, the patterns that hold up under load, and the trade-offs that are worth taking on knowingly rather than by accident.</p>

<h2 id="the-shape-of-the-problem">The shape of the problem</h2>
<p>Every team I've worked with this year has run into the same wall at roughly the same point. The first prototype is fast. The second integration is fine. The third is where everything starts to drag — not because the code is bad, but because the assumptions baked into the first prototype no longer hold.</p>

<blockquote>"Most production incidents are not bugs. They are assumptions that quietly expired."</blockquote>

<p>The teams that handle this gracefully have two habits in common. They make their assumptions explicit, and they revisit them on a schedule. That is most of the trick.</p>

<h2 id="three-patterns-that-hold-up">Three patterns that hold up</h2>
<p>Across very different products, three patterns keep returning. They are not novel — they are durable.</p>

<ul>
  <li><strong>Small, reversible decisions.</strong> Prefer changes that can be undone in an afternoon. Reserve big decisions for the few places they actually pay off.</li>
  <li><strong>Boring interfaces, sharp internals.</strong> The interfaces other people touch should be predictable. The internals can be as clever as the problem demands.</li>
  <li><strong>Observability as a first-class concern.</strong> If you can't see it, you can't trust it. Logs, traces and metrics are part of the product, not a follow-up.</li>
</ul>

<h2 id="what-to-watch-next">What to watch next</h2>
<p>The next 12 months will not be defined by any single tool. They will be defined by how quickly teams internalize a few simple ideas: smaller diffs, faster feedback, fewer surprises. The teams that get there first will look, from the outside, like they got lucky.</p>

<h2 id="closing-thoughts">Closing thoughts</h2>
<p>Software craft is mostly the discipline of paying attention to the boring things on purpose. The exciting stuff takes care of itself.</p>
`;

export const comments: Comment[] = [
  {
    id: "c1",
    postSlug: "the-quiet-revolution-of-agentic-llms",
    author: "Hana Park",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop",
    date: "2026-06-19",
    content: "Great piece — the framing of agents as 'durable workflows that happen to use a model' really clicked for me.",
    likes: 24,
  },
  {
    id: "c2",
    postSlug: "the-quiet-revolution-of-agentic-llms",
    author: "Daniel Okafor",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80&auto=format&fit=crop",
    date: "2026-06-19",
    content: "Would love a follow-up on evaluation. That's where most of our team gets stuck.",
    likes: 11,
  },
  {
    id: "c3",
    postSlug: "the-quiet-revolution-of-agentic-llms",
    author: "Ivy Tanaka",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80&auto=format&fit=crop",
    date: "2026-06-20",
    content: "Subscribed. The 'agents are graduating' framing is going in my next deck (with credit).",
    likes: 9,
  },
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
export function getPostsByCategory(slug: string): Post[] {
  return posts.filter((p) => p.category === slug);
}
export function getPostsByAuthor(slug: string): Post[] {
  return posts.filter((p) => p.authorSlug === slug);
}
export function getPostsByTag(slug: string): Post[] {
  return posts.filter((p) => p.tags.includes(slug));
}
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  return posts
    .filter((p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, limit);
}
export function getCommentsForPost(slug: string): Comment[] {
  return comments.filter((c) => c.postSlug === slug);
}
export function getFeaturedPost(): Post {
  return posts.find((p) => p.featured) ?? posts[0];
}
export function getTrendingPosts(limit = 4): Post[] {
  return posts.filter((p) => p.trending).slice(0, limit);
}
export function getLatestPosts(limit = 9): Post[] {
  return [...posts]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit);
}
