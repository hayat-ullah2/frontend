import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Newsletter from "@/components/site/Newsletter";
import { ArrowRight, Check, Github, Layers, Linkedin, Mail, Sparkles, User } from "@/components/Icon";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nexversal is an independent publication about AI tools and software, founded and edited by Hayat Ullah. Learn our mission, editorial principles and how we research.",
};

const helps = [
  "Discover useful AI and software tools",
  "Understand features and limitations",
  "Compare competing products",
  "Evaluate pricing and value",
  "Find tools for specific workflows and use cases",
  "Learn how to use new technologies effectively",
  "Make informed decisions before investing time or money",
];

const focusAreas = [
  "Artificial intelligence & AI tools",
  "AI coding & developer tools",
  "Software & SaaS products",
  "Web development technologies",
  "Productivity tools",
  "AI writing, image & video tools",
  "Emerging technology",
  "Practical software workflows",
];

const coverAreas = [
  {
    title: "AI Writing Tools",
    body: "AI writing platforms for content creation, editing, research, marketing and everyday writing workflows.",
  },
  {
    title: "AI Coding Tools",
    body: "AI-powered coding assistants, developer platforms and programming tools that help developers build software more efficiently.",
  },
  {
    title: "AI Image & Video Tools",
    body: "Tools for generating, editing, enhancing and working with visual content.",
  },
  {
    title: "AI Productivity Tools",
    body: "Software designed to improve research, organization, automation, communication and everyday productivity.",
  },
  {
    title: "AI Chatbots & Assistants",
    body: "AI assistants and chatbot platforms — their capabilities, limitations, pricing and practical use cases.",
  },
  {
    title: "Software & Comparisons",
    body: "Side-by-side comparisons based on features, pricing, usability, capabilities and the needs of different users.",
  },
];

const principles = [
  {
    title: "Write what matters",
    body: "We prioritize useful, original content over publishing for volume. A good article should answer a real question, solve a real problem, or help you make a better decision.",
  },
  {
    title: "Research before recommending",
    body: "We don't recommend software just because it's popular. Our research reviews official documentation, pricing, features, integrations and real workflows.",
  },
  {
    title: "Be honest about limitations",
    body: "No software is perfect. When we recommend a product we explain both its strengths and its limitations so you can decide whether it fits your needs.",
  },
  {
    title: "Keep information transparent",
    body: "Pricing, features and availability change over time. We review important information and correct errors when they're identified.",
  },
  {
    title: "Respect our readers",
    body: "Nexversal doesn't exist just to generate clicks. We avoid misleading claims and clearly disclose commercial or affiliate relationships when they exist.",
  },
];

const researchSources = [
  "Official product websites",
  "Product documentation",
  "Pricing pages",
  "Feature documentation",
  "Product updates",
  "Available integrations",
  "Real-world workflows",
  "Hands-on testing when applicable",
];

const questions = [
  "What is it?",
  "How does it work?",
  "What does it cost?",
  "What can I actually use it for?",
  "What are the limitations?",
  "And is it worth my time?",
];

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <span className="chip">
            <Sparkles size={12} /> About us
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Practical guides to the tools that{" "}
            <span className="text-gradient-accent">actually ship.</span>
          </h1>
          <p className="mt-5 text-foreground-muted text-lg max-w-2xl mx-auto">
            Nexversal is an independent publication focused on AI tools, software
            and emerging technology. We research and explain the tools shaping how
            people write, code, create, work and build businesses — see{" "}
            <Link href="/how-we-test" className="underline hover:text-foreground">
              how we test
            </Link>
            .
          </p>
          <div className="mt-8">
            <Link href="/blog" className="btn-primary inline-flex">
              Browse articles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[5/4] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop"
              alt="Working through a developer tooling comparison"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              The AI and software landscape is changing quickly. New tools appear
              every day, pricing changes frequently, and marketing claims can make
              it hard to understand which products are genuinely useful.
            </p>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              Nexversal exists to make that easier — practical, research-backed
              content that helps readers:
            </p>
            <ul className="mt-5 space-y-2.5">
              {helps.map((h) => (
                <li key={h} className="flex items-start gap-3 text-foreground-muted">
                  <span className="mt-0.5 shrink-0 text-accent">
                    <Check size={18} />
                  </span>
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Meet the founder */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">
            <User size={12} /> The founder
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Meet the founder
          </h2>
        </div>
        <div className="mt-10 card p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-gradient-accent grid place-items-center text-white">
              <User size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Hayat Ullah</h3>
              <p className="text-accent font-medium">Founder &amp; Editor of Nexversal</p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/hayat-ullah-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hayat Ullah on LinkedIn"
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-foreground-muted hover:text-foreground hover:border-white/25 transition-colors"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href="https://github.com/hayat-ullah2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hayat Ullah on GitHub"
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-foreground-muted hover:text-foreground hover:border-white/25 transition-colors"
                >
                  <Github size={16} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-foreground-muted leading-relaxed max-w-3xl">
            <p>
              Nexversal was founded by Hayat Ullah, a software engineer and
              technology enthusiast focused on modern web development, AI-powered
              applications and emerging software technologies.
            </p>
            <p>
              Through hands-on experience building software and working with modern
              development tools, Hayat has developed a practical perspective on how
              AI and software products work in real-world environments — and created
              Nexversal to bring that perspective to a wider audience.
            </p>
            <p>
              The idea is straightforward: instead of following every new AI trend,
              focus on understanding the technology, testing what matters,
              researching the available information, and explaining the results in a
              way readers can actually use. As Founder &amp; Editor, Hayat oversees
              the site&apos;s editorial direction, technology coverage, research
              standards and overall content quality.
            </p>
          </div>
          <div className="mt-6">
            <p className="text-xs text-foreground-subtle uppercase tracking-wider">
              Areas of focus
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {focusAreas.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground-muted"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we cover */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">
            <Layers size={12} /> Coverage
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">What we cover</h2>
          <p className="mt-3 text-foreground-muted">
            Areas where software and AI can make a meaningful difference.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverAreas.map((c) => (
            <div key={c.title} className="card p-6">
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial principles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">What we believe</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Our editorial principles
          </h2>
          <p className="mt-3 text-foreground-muted">
            A few basic principles behind every piece we publish.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <div key={p.title} className="card p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent grid place-items-center text-white font-bold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How we research */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How we research</h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              For product reviews and comparisons, we research information from
              sources such as the ones on the right. We separate hands-on testing
              from research-based evaluation and never present something as
              personally tested when it was not.
            </p>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              For more on our evaluation process, see our{" "}
              <Link href="/how-we-test" className="underline hover:text-foreground">
                How We Test
              </Link>{" "}
              page.
            </p>
          </div>
          <div className="card p-6">
            <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
              {researchSources.map((s) => (
                <li key={s} className="flex items-start gap-3 text-foreground-muted">
                  <span className="mt-0.5 shrink-0 text-accent">
                    <Check size={18} />
                  </span>
                  <span className="text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Accuracy + independence + disclosure */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-lg">Our commitment to accuracy</h3>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
              Technology changes quickly and mistakes can happen. If we find an
              article contains incorrect, outdated or misleading information, we aim
              to correct it rather than leave it published. Readers can report
              corrections through our{" "}
              <Link href="/contact" className="underline hover:text-foreground">
                contact page
              </Link>
              .
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-lg">Independent editorial voice</h3>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
              Nexversal is independently operated and editorially directed. When a
              product is worth recommending, we explain why. When there are important
              limitations, we explain those too — based on usefulness to our readers,
              not marketing messages.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-lg">Affiliate &amp; commercial disclosure</h3>
            <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
              Some articles may contain affiliate links. If you purchase through one,
              Nexversal may earn a commission at no additional cost to you. This
              never changes our editorial coverage. See our{" "}
              <Link href="/disclosure" className="underline hover:text-foreground">
                Disclosure Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Built around a simple idea */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="chip">Why Nexversal</span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
          Built around a simple idea
        </h2>
        <p className="mt-4 text-foreground-muted leading-relaxed max-w-2xl mx-auto">
          Technology should be easier to understand. We&apos;re building Nexversal
          for people who want more than another list of tools — they want to know:
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <div
              key={q}
              className="card p-5 text-left font-medium text-foreground flex items-center gap-3"
            >
              <span className="text-accent shrink-0">
                <ArrowRight size={16} />
              </span>
              {q}
            </div>
          ))}
        </div>
        <p className="mt-8 text-foreground-muted">
          Research deeply. Understand clearly. Choose confidently.
        </p>
      </section>

      {/* Contact strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card p-8 grid sm:grid-cols-2 gap-6 items-center">
          <Info icon={<Mail size={18} />} label="Email" value="hayatka472@gmail.com" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent grid place-items-center text-white">
              <ArrowRight size={18} />
            </div>
            <div>
              <p className="text-xs text-foreground-subtle uppercase tracking-wider">
                Prefer a form?
              </p>
              <Link href="/contact" className="text-foreground font-medium hover:underline">
                Use our contact page
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </section>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-accent grid place-items-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
