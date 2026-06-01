"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useAdminBlogPosts,
  useCreateBlogPostMutation,
  useDeleteBlogPostMutation,
  useUpdateBlogPostMutation,
} from "@/hooks/queries/useBlogAdmin";
import { getErrorDetail } from "@/lib/apiErrors";
import type { AdminBlogPost, BlogPostStatus } from "@/lib/contentApi";
import { AppRoutesPaths } from "@/route/paths";
import { LoadingState } from "@/components/ui/LoadingSpinner";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_url: "",
  status: "DRAFT" as BlogPostStatus,
};

function StatusBadge({ status }: { status: BlogPostStatus }) {
  const styles: Record<BlogPostStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    SCHEDULED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status === "PUBLISHED" ? "Published" : status === "SCHEDULED" ? "Scheduled" : "Draft"}
    </span>
  );
}

export default function AdminBlog() {
  const [editing, setEditing] = useState<AdminBlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const { data, isLoading, isError, error } = useAdminBlogPosts({ page: 1, page_size: 50 });
  const createMutation = useCreateBlogPostMutation();
  const updateMutation = useUpdateBlogPostMutation();
  const deleteMutation = useDeleteBlogPostMutation();

  const posts = data?.results ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
  };

  const loadForEdit = (post: AdminBlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      cover_url: post.cover_url ?? "",
      status: post.status,
    });
    setSlugTouched(true);
  };

  const effectiveSlug = useMemo(() => {
    if (slugTouched && form.slug.trim()) return form.slug.trim();
    if (form.title.trim()) return slugify(form.title);
    return "";
  }, [form.slug, form.title, slugTouched]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const slug = effectiveSlug;
    const body = form.body.trim();
    if (!title || !slug || !body) {
      toast.error("Title, slug, and body are required.");
      return;
    }
    const payload = {
      title,
      slug,
      body,
      excerpt: form.excerpt.trim(),
      cover_url: form.cover_url.trim(),
      status: form.status,
      seo_title: title,
      seo_description: form.excerpt.trim().slice(0, 500),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success("Post updated.");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(
          form.status === "PUBLISHED"
            ? "Post published. It will appear on the site within a few minutes."
            : "Post saved as draft.",
        );
      }
      resetForm();
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not save post.");
    }
  };

  const remove = async (post: AdminBlogPost) => {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted.");
      if (editing?.id === post.id) resetForm();
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not delete post.");
    }
  };

  return (
    <div className="space-y-8">
      <p className="text-sm ff-muted">
        Write posts in Markdown. Published posts appear on the{" "}
        <Link href={AppRoutesPaths.blog.index} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          public blog
        </Link>{" "}
        and the homepage blog section.
      </p>

      <form onSubmit={submit} className="ff-card max-w-3xl space-y-4">
        <h3 className="text-lg font-semibold ff-heading">
          {editing ? "Edit post" : "New post"}
        </h3>
        <label className="block text-sm">
          <span className="ff-muted">Title</span>
          <input
            className="ff-dashboard-select mt-1 w-full"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: slugTouched ? f.slug : slugify(title),
              }));
            }}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="ff-muted">URL slug</span>
          <input
            className="ff-dashboard-select mt-1 w-full font-mono text-sm"
            value={slugTouched ? form.slug : effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="ff-muted">Excerpt (shown on cards)</span>
          <textarea
            className="ff-dashboard-select mt-1 min-h-[72px] w-full"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={2}
          />
        </label>
        <label className="block text-sm">
          <span className="ff-muted">Cover image URL (optional)</span>
          <input
            className="ff-dashboard-select mt-1 w-full"
            type="url"
            value={form.cover_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
            placeholder="https://…"
          />
        </label>
        <label className="block text-sm">
          <span className="ff-muted">Body (Markdown)</span>
          <textarea
            className="ff-dashboard-select mt-1 min-h-[200px] w-full font-mono text-sm"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            required
            placeholder={"## Heading\n\nYour content…"}
          />
        </label>
        <label className="block text-sm">
          <span className="ff-muted">Status</span>
          <select
            className="ff-dashboard-select mt-1"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as BlogPostStatus }))
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Update post" : "Publish / save"}
          </button>
          {editing ? (
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium ff-muted hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold ff-heading">Your posts</h3>
        {isLoading ? <LoadingState /> : null}
        {isError ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {getErrorDetail(error) ?? "Could not load posts."}
          </p>
        ) : null}
        {!isLoading && !isError && posts.length === 0 ? (
          <p className="text-sm ff-muted">No posts yet. Create one above.</p>
        ) : null}
        {!isLoading && posts.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium ff-muted">Title</th>
                  <th className="px-4 py-3 text-left font-medium ff-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium ff-muted">Updated</th>
                  <th className="px-4 py-3 text-right font-medium ff-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-4 py-3 font-medium ff-heading">{post.title}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 ff-muted">
                      {new Date(post.updated_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {post.status === "PUBLISHED" ? (
                          <Link
                            href={AppRoutesPaths.blog.post(post.slug)}
                            className="text-indigo-600 hover:underline dark:text-indigo-400"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                          onClick={() => loadForEdit(post)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-rose-600 hover:underline dark:text-rose-400"
                          onClick={() => void remove(post)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
