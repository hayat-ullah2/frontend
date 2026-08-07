import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AccountForm from "@/components/site/AccountForm";
import { apiServer } from "@/lib/apiServer";
import { ApiError } from "@/lib/api";
import type { ApiUser } from "@/lib/models";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your NexBlog profile.",
};

export default async function AccountPage() {
  let user: ApiUser;
  try {
    user = await apiServer<ApiUser>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="mb-8">
        <span className="chip">Profile</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Your account</h1>
        <p className="mt-2 text-foreground-muted">
          Update your display name, bio, and profile photo. Public author page:{" "}
          <Link href={`/author/${user._id}`} className="text-foreground underline underline-offset-2">
            /author/{user._id}
          </Link>
          .
        </p>
      </div>
      <AccountForm user={user} />
    </div>
  );
}
