import { Mail, Sparkles } from "../Icon";

export default function Newsletter() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/5 p-8 sm:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-fuchsia-500/5 to-blue-600/15" />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
      />

      <div className="relative grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="chip">
            <Sparkles size={12} /> Weekly digest
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">
            The best of NexBlog,{" "}
            <span className="text-gradient-accent">delivered Sundays.</span>
          </h2>
          <p className="mt-3 text-foreground-muted max-w-md">
            One handpicked essay, three sharp links, and zero noise. Join 42,000+
            curious people building the future.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-background border border-white/10 flex-1">
            <Mail size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              className="bg-transparent outline-none border-0 text-foreground placeholder:text-foreground-subtle w-full"
            />
          </div>
          <button type="button" className="btn-primary px-6">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
