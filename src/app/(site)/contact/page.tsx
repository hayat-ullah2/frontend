import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  Twitter,
} from "@/components/Icon";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Nexversal team.",
};

const faqs = [
  {
    q: "How can I pitch an article?",
    a: "Send a one-paragraph pitch to hello@nexversal.com. We're a small editorial operation, so replies can take up to two weeks.",
  },
  {
    q: "Do you pay writers?",
    a: "When we commission a piece, we agree on rates with the writer directly. Send your pitch to hello@nexversal.com and we'll take it from there.",
  },
  {
    q: "Can I republish a Nexversal article?",
    a: "For non-commercial use with attribution, yes. For commercial syndication, please email hello@nexversal.com.",
  },
  {
    q: "How do you choose what to cover?",
    a: "Editorial decisions are made by our editorial team. We aim for depth, not chasing news cycles.",
  },
  {
    q: "Where can I report a correction?",
    a: "Use the correction link at the bottom of any article, or email hello@nexversal.com. We aim to update within a few days.",
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
            channel that fits and we&apos;ll write back.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <ContactForm />

        {/* Info */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold">Direct lines</h3>
            <div className="mt-4 space-y-4">
              <Line
                icon={<Mail size={16} />}
                label="Email"
                value="hello@nexversal.com"
                href="mailto:hello@nexversal.com"
              />
              <Line
                icon={<Phone size={16} />}
                label="Phone"
                value="+92 336 7828946"
                href="tel:+923367828946"
              />
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold">Follow along</h3>
            <p className="text-sm text-foreground-muted mt-1">
              The same Nexversal, in shorter form.
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

function Line({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-accent grid place-items-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-xs text-foreground-subtle uppercase tracking-wider">{label}</p>
        {href ? (
          <a href={href} className="text-sm hover:text-foreground hover:underline transition">
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}
