import Link from "next/link";

export default function AuthTabs({ active }: { active: "signup" | "login" }) {
  const base =
    "flex-1 text-center text-sm font-medium py-2.5 rounded-lg transition";
  const activeCls = "bg-white/5 text-foreground shadow-inner";
  const inactiveCls = "text-foreground-muted hover:text-foreground";

  return (
    <div className="mt-8 grid grid-cols-2 p-1 rounded-xl bg-background border border-white/10">
      <Link
        href="/signup"
        className={`${base} ${active === "signup" ? activeCls : inactiveCls}`}
      >
        Sign up
      </Link>
      <Link
        href="/login"
        className={`${base} ${active === "login" ? activeCls : inactiveCls}`}
      >
        Log in
      </Link>
    </div>
  );
}
