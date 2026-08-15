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

// ── AI Tools & Software niche ────────────────────────────────────────────────
// Every category is a sub-topic of "AI tools" so the site builds real topical
// authority (Google ranks focused sites, not scattered ones). The navbar links
// to some of these slugs — keep them in sync (see Navbar.tsx NAV_LINKS).
const CATEGORIES = [
  { name: "AI Writing Tools", description: "AI writers, copy and content generators — reviewed and compared.", color: "from-purple-500 to-fuchsia-500" },
  { name: "AI Coding Tools", description: "AI code assistants, copilots and pair-programmers for developers.", color: "from-emerald-500 to-teal-400" },
  { name: "AI Image Tools", description: "AI image generators, editors and design tools.", color: "from-pink-500 to-rose-400" },
  { name: "AI Video Tools", description: "AI video generators, editors and avatar tools.", color: "from-red-500 to-orange-400" },
  { name: "AI Chatbots & Assistants", description: "ChatGPT, Claude, Gemini and other AI assistants — compared.", color: "from-blue-500 to-cyan-400" },
  { name: "AI for Business", description: "AI tools for marketing, sales, support and operations.", color: "from-amber-500 to-orange-400" },
  { name: "AI Productivity Tools", description: "AI note-takers, meeting and workflow-automation tools.", color: "from-indigo-500 to-blue-400" },
  { name: "Comparisons", description: "Side-by-side, head-to-head AI tool comparisons.", color: "from-violet-500 to-purple-400" },
  { name: "Guides & Tutorials", description: "Step-by-step how-tos for getting the most from AI tools.", color: "from-teal-500 to-emerald-400" },
];

const TAGS = [
  "ChatGPT", "Claude", "Gemini", "Midjourney", "GitHub Copilot",
  "Free Tools", "Paid Tools", "Alternatives", "Pricing", "Review",
  "Comparison", "Tutorial", "Writing", "Coding", "Automation",
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
  { title: "The 9 best AI writing tools in 2026 (tested)", excerpt: "We tested the top AI writers head-to-head on quality, pricing and ease of use — here's what actually earns your money.", cover: cover("photo-1677442136019-21780ecad995"), category: "AI Writing Tools", tags: ["Review", "Writing", "Comparison"], featured: true, trending: true },
  { title: "ChatGPT vs Claude vs Gemini: which should you use?", excerpt: "A side-by-side comparison of the three leading AI assistants across writing, coding, reasoning and price.", cover: cover("photo-1526378722484-bd91ca387e72"), category: "Comparisons", tags: ["ChatGPT", "Claude", "Gemini", "Comparison"], trending: true },
  { title: "GitHub Copilot vs Cursor: the honest comparison", excerpt: "Two AI coding assistants, one workflow test. Which one ships code faster?", cover: cover("photo-1517694712202-14dd9538aa97"), category: "AI Coding Tools", tags: ["GitHub Copilot", "Coding", "Comparison"], trending: true },
  { title: "7 best free AI image generators (no watermark)", excerpt: "The best genuinely free AI image tools — with their real limits spelled out.", cover: cover("photo-1547891654-e66ed7ebb968"), category: "AI Image Tools", tags: ["Free Tools", "Review", "Midjourney"] },
  { title: "Best AI video generators for creators in 2026", excerpt: "From text-to-video to AI avatars — which tools are ready for real work.", cover: cover("photo-1574717024653-61fd2cf4d44d"), category: "AI Video Tools", tags: ["Review", "Paid Tools"] },
  { title: "How to automate your inbox with AI (step by step)", excerpt: "A practical setup for triaging and drafting email with AI — in under an hour.", cover: cover("photo-1554224155-6726b3ff858f"), category: "Guides & Tutorials", tags: ["Tutorial", "Automation"] },
  { title: "Best AI note-takers for meetings, compared", excerpt: "We ran five AI meeting assistants on the same calls. Accuracy, price and privacy compared.", cover: cover("photo-1552581234-26160f608093"), category: "AI Productivity Tools", tags: ["Review", "Comparison"] },
  { title: "10 AI tools every small business should use", excerpt: "Affordable AI tools for marketing, support and operations that pay for themselves.", cover: cover("photo-1551288049-bebda4e38f71"), category: "AI for Business", tags: ["Paid Tools", "Automation"] },
  { title: "Midjourney vs DALL·E vs Stable Diffusion", excerpt: "Which AI image generator wins on quality, control and cost?", cover: cover("photo-1620712943543-bcc4688e7485"), category: "Comparisons", tags: ["Midjourney", "Comparison", "Review"] },
  { title: "The best ChatGPT alternatives worth trying", excerpt: "Free and paid AI chatbots that go head-to-head with ChatGPT — and where each one wins.", cover: cover("photo-1531746790731-6c087fecd65a"), category: "AI Chatbots & Assistants", tags: ["ChatGPT", "Alternatives", "Free Tools"] },
  { title: "How to write better prompts (with examples)", excerpt: "A repeatable framework for getting sharper output from any AI tool.", cover: cover("photo-1432888622747-4eb9a8efeb07"), category: "Guides & Tutorials", tags: ["Tutorial", "Writing"] },
  { title: "Best AI coding assistants for beginners", excerpt: "Learning to code with AI? These assistants teach instead of just autocompleting.", cover: cover("photo-1503676260728-1c00da094a0b"), category: "AI Coding Tools", tags: ["Coding", "Review", "Free Tools"] },
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
