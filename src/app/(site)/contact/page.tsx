import type { Metadata } from "next";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Twitter,
} from "@/components/Icon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NexBlog team.",
};

const faqs = [
  {
    q: "How can I pitch an article?",
    a: "Send a one-paragraph pitch to pitches@nexblog.com. We respond to every pitch within five business days, whether we take it or not.",
  },
  {
    q: "Do you pay writers?",
    a: "Yes. Our standard rate is $0.40 per word, with bonuses for evergreen pieces that continue performing six months in.",
  },
  {
    q: "Can I republish a NexBlog article?",
    a: "For non-commercial use with attribution, yes. For commercial syndication, please email partnerships@nexblog.com.",
  },
  {
    q: "How do you choose what to cover?",
    a: "Editorial decisions are made weekly by the editor in chief and two rotating editors. We aim for depth, not chasing news cycles.",
  },
  {
    q: "Where can I report a correction?",
    a: "Use the correction link at the bottom of any article, or email corrections@nexblog.com. We aim to update within 24 hours.",
  },
];

export default function ContactPage() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-20 text-center">
          <span className="chip">
            <Sparkles size={12} /> Talk to us
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight">
            Get in <span className="text-gradient-accent">touch</span>
          </h1>
          <p className="mt-4 text-foreground-muted text-lg">
            Pitches, partnerships, press, corrections, or just a hello — pick the
            channel that fits and we'll write back.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <form className="lg:col-span-3 card p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" placeholder="Ada Lovelace" />
            <Field label="Email" placeholder="you@example.com" type="email" />
          </div>
          <Field label="Subject" placeholder="What's it about?" />
          <div>
            <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
              Topic
            </label>
            <select className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none">
              <option>General inquiry</option>
              <option>Pitch an article</option>
              <option>Partnerships</option>
              <option>Press</option>
              <option>Corrections</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              rows={6}
              placeholder="Tell us a bit more…"
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground-subtle">
              By submitting you agree to our privacy policy.
            </p>
            <button type="button" className="btn-primary">
              Send message
            </button>
          </div>
        </form>

        {/* Info */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold">Direct lines</h3>
            <div className="mt-4 space-y-4">
              <Line icon={<Mail size={16} />} label="Email" value="hello@nexblog.com" />
              <Line icon={<Phone size={16} />} label="Phone" value="+41 22 555 0142" />
              <Line icon={<MapPin size={16} />} label="Office" value="Limmatquai 12, 8001 Zürich" />
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold">Follow along</h3>
            <p className="text-sm text-foreground-muted mt-1">
              The same NexBlog, in shorter form.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a className="btn-ghost p-2" href="#" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a className="btn-ghost p-2" href="#" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a className="btn-ghost p-2" href="#" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center">
          <span className="chip">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently asked
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="card p-5 group"
              open={i === 0}
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="font-medium">{f.q}</span>
                <span className="w-7 h-7 rounded-full border border-white/10 grid place-items-center text-foreground-subtle group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-foreground-subtle uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle"
      />
    </div>
  );
}

function Line({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-accent grid place-items-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
