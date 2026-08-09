import { setServers } from "node:dns";
import mongoose from "mongoose";
import slugify from "slugify";
import { connectDB } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { Tag } from "../models/Tag.js";
import { User } from "../models/User.js";

const slug = (s: string) => slugify(s, { lower: true, strict: true });

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const CATEGORIES = [
  { name: "Technology", description: "Hardware, gadgets, and the cutting edge of consumer tech.", color: "from-blue-500 to-cyan-400" },
  { name: "Artificial Intelligence", description: "LLMs, agents, ML research and applied AI.", color: "from-purple-500 to-fuchsia-500" },
  { name: "Programming", description: "Languages, frameworks, patterns and craft.", color: "from-emerald-500 to-teal-400" },
  { name: "Cybersecurity", description: "Threats, defenses, audits and policy.", color: "from-red-500 to-rose-400" },
  { name: "Business", description: "Strategy, leadership and the startup grind.", color: "from-amber-500 to-orange-400" },
  { name: "Finance", description: "Markets, investing and personal finance.", color: "from-yellow-500 to-amber-400" },
  { name: "Health & Fitness", description: "Performance, nutrition, sleep and longevity.", color: "from-lime-500 to-green-400" },
  { name: "Education", description: "Learning, curricula and skill development.", color: "from-indigo-500 to-blue-400" },
  { name: "Travel", description: "Destinations, guides and travel tech.", color: "from-sky-500 to-cyan-400" },
  { name: "Lifestyle", description: "Habits, productivity, and design for living.", color: "from-pink-500 to-rose-400" },
  { name: "Sports", description: "Analysis, athletes, and the science of sport.", color: "from-orange-500 to-red-400" },
  { name: "Motivation", description: "Mindset, focus, and the long game.", color: "from-fuchsia-500 to-pink-400" },
  { name: "Crypto", description: "Web3, DeFi, on-chain analysis.", color: "from-violet-500 to-purple-400" },
  { name: "Digital Marketing", description: "SEO, growth and content strategy.", color: "from-teal-500 to-emerald-400" },
];

const TAGS = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js",
  "LLM", "Agents", "Rust", "Python", "DevOps",
  "Career", "Design", "SEO", "Startups", "Investing",
];

const SAMPLE_CONTENT = `<p>This is a sample article body rendered for the demo. In production, this would be loaded from the CMS pipeline.</p>
<h2 id="introduction">Introduction</h2>
<p>The most interesting shifts in software rarely arrive with a press release. They show up as a quiet change in how teams build and ship.</p>
<h2 id="three-patterns-that-hold-up">Three patterns that hold up</h2>
<ul><li><strong>Small, reversible decisions.</strong></li><li><strong>Boring interfaces, sharp internals.</strong></li><li><strong>Observability as a first-class concern.</strong></li></ul>
<h2 id="closing-thoughts">Closing thoughts</h2>
<p>Software craft is mostly the discipline of paying attention to the boring things on purpose.</p>`;

const cover = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&q=80&auto=format&fit=crop`;

const POSTS: Array<{
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  tags: string[];
  featured?: boolean;
  trending?: boolean;
}> = [
  { title: "The quiet revolution of agentic LLMs", excerpt: "Why agents are graduating from demos to production — and what the next 12 months look like.", cover: cover("photo-1677442136019-21780ecad995"), category: "Artificial Intelligence", tags: ["LLM", "Agents", "Python"], featured: true, trending: true },
  { title: "Building resilient edge APIs with Next.js", excerpt: "Patterns for graceful degradation, caching strategy and observability at the edge.", cover: cover("photo-1517694712202-14dd9538aa97"), category: "Programming", tags: ["Next.js", "TypeScript", "DevOps"], trending: true },
  { title: "The anatomy of a supply chain attack", excerpt: "A breakdown of three real incidents and the defenses that would have caught them earlier.", cover: cover("photo-1550751827-4bd374c3f58b"), category: "Cybersecurity", tags: ["DevOps"], trending: true },
  { title: "Why pricing is strategy, not a number", excerpt: "Pricing decisions encode positioning.", cover: cover("photo-1551288049-bebda4e38f71"), category: "Business", tags: ["Startups", "Career"] },
  { title: "A personal finance stack for 2026", excerpt: "The tools, accounts and routines that actually matter.", cover: cover("photo-1554224155-6726b3ff858f"), category: "Finance", tags: ["Investing"] },
  { title: "Training for longevity, not just strength", excerpt: "What the latest research says about preserving function into your 70s and 80s.", cover: cover("photo-1517836357463-d25dfeac3438"), category: "Health & Fitness", tags: [] },
  { title: "Why Rust is eating systems programming", excerpt: "From kernels to CDNs, Rust is quietly winning.", cover: cover("photo-1555066931-4365d14bab8c"), category: "Programming", tags: ["Rust", "DevOps"] },
  { title: "The traveler's remote work kit", excerpt: "A field-tested setup for working from anywhere.", cover: cover("photo-1488646953014-85cb44e25828"), category: "Travel", tags: ["Design"] },
  { title: "Designing with restraint", excerpt: "The case for fewer features, smaller surfaces and clearer hierarchies.", cover: cover("photo-1545239351-1141bd82e8a6"), category: "Lifestyle", tags: ["Design"] },
  { title: "Stablecoins quietly ate cross-border payments", excerpt: "The numbers behind the shift, and what it means for fintech in 2026.", cover: cover("photo-1518544866330-95a2bec01ee5"), category: "Crypto", tags: ["Investing"] },
  { title: "SEO in the age of answer engines", excerpt: "How content strategy is changing when LLMs are the front page.", cover: cover("photo-1432888622747-4eb9a8efeb07"), category: "Digital Marketing", tags: ["SEO"] },
  { title: "The self-taught engineer's curriculum", excerpt: "A practical path through the fundamentals, with no fluff.", cover: cover("photo-1503676260728-1c00da094a0b"), category: "Education", tags: ["Career", "Python"] },
];

async function run() {
  await connectDB();

  console.log("[seed] upserting %d categories…", CATEGORIES.length);
  const catMap = new Map<string, mongoose.Types.ObjectId>();
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: c.name },
      { $set: { ...c, slug: slug(c.name) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    catMap.set(c.name, doc._id as mongoose.Types.ObjectId);
  }

  console.log("[seed] upserting %d tags…", TAGS.length);
  const tagMap = new Map<string, mongoose.Types.ObjectId>();
  for (const name of TAGS) {
    const doc = await Tag.findOneAndUpdate(
      { name },
      { $set: { name, slug: slug(name) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    tagMap.set(name, doc._id as mongoose.Types.ObjectId);
  }

  const admin = await User.findOne({ email: "admin@nexes.com" });
  if (!admin) {
    console.error("[seed] admin user not found — run `npm run seed:admin` first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("[seed] upserting %d posts…", POSTS.length);
  for (const p of POSTS) {
    const categoryId = catMap.get(p.category);
    if (!categoryId) continue;
    const tagIds = p.tags
      .map((t) => tagMap.get(t))
      .filter((x): x is mongoose.Types.ObjectId => !!x);

    await Post.findOneAndUpdate(
      { title: p.title },
      {
        $set: {
          title: p.title,
          slug: slug(p.title),
          excerpt: p.excerpt,
          content: SAMPLE_CONTENT,
          cover: p.cover,
          category: categoryId,
          tags: tagIds,
          author: admin._id,
          status: "published",
          publishedAt: new Date(),
          featured: !!p.featured,
          trending: !!p.trending,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // Refresh denormalized counters.
  for (const c of CATEGORIES) {
    const id = catMap.get(c.name);
    if (!id) continue;
    const count = await Post.countDocuments({ category: id });
    await Category.updateOne({ _id: id }, { $set: { postCount: count } });
  }
  for (const t of TAGS) {
    const id = tagMap.get(t);
    if (!id) continue;
    const count = await Post.countDocuments({ tags: id });
    await Tag.updateOne({ _id: id }, { $set: { postCount: count } });
  }

  const [cats, tags, posts] = await Promise.all([
    Category.countDocuments(),
    Tag.countDocuments(),
    Post.countDocuments(),
  ]);
  console.log("[seed] done. categories=%d tags=%d posts=%d", cats, tags, posts);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
