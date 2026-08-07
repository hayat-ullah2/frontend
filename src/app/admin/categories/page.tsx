import CategoryCreateForm from "@/components/admin/CategoryCreateForm";
import CategoryRowActions from "@/components/admin/CategoryRowActions";
import Topbar from "@/components/admin/Topbar";
import { Plus } from "@/components/Icon";
import { apiServerSafe } from "@/lib/apiServer";
import type { ApiCategory } from "@/lib/models";

export default async function AdminCategoriesPage() {
  const categories = await apiServerSafe<ApiCategory[]>("/categories", []);
  const totalPosts = categories.reduce((s, c) => s + c.postCount, 0);

  return (
    <>
      <Topbar
        title="Categories"
        subtitle={`${categories.length} categories · used across ${totalPosts} posts`}
        action={
          <a href="#create-form" className="btn-primary text-sm">
            <Plus size={14} /> New category
          </a>
        }
      />

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div id="create-form" className="lg:col-span-1">
          <CategoryCreateForm />
        </div>

        <div className="card lg:col-span-2 overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-sm text-foreground-subtle">
              No categories yet. Create one on the left.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-foreground-subtle">
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Slug</th>
                  <th className="text-right p-4 font-medium">Posts</th>
                  <th className="text-right p-4 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} grid place-items-center text-white text-sm font-bold`}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-foreground-subtle line-clamp-1">
                            {c.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-foreground-subtle">
                      /{c.slug}
                    </td>
                    <td className="p-4 text-right">{c.postCount}</td>
                    <td className="p-4 text-right">
                      <CategoryRowActions slug={c.slug} name={c.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
