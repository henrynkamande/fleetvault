"use client";

import Link from "next/link";
import { toast } from "react-toastify";
import {
  useAdminBlogPosts,
  useDeleteBlogPostMutation,
  useUpdateBlogPostMutation,
} from "@/hooks/queries/useBlogAdmin";
import { getErrorDetail } from "@/lib/apiErrors";
import { fleetConfirm } from "@/lib/fleetAlert";
import type { AdminBlogPost, BlogPostStatus } from "@/lib/contentApi";
import { AppRoutesPaths } from "@/route/paths";
import { LoadingState } from "@/components/ui/LoadingSpinner";

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

function blogEditHref(post: AdminBlogPost): string {
  const base = AppRoutesPaths.dashboard.admin.blogAdd;
  return `${base}?id=${encodeURIComponent(post.id)}`;
}

export default function AdminBlog() {
  const { data, isLoading, isError, error } = useAdminBlogPosts({ page: 1, page_size: 50 });
  const deleteMutation = useDeleteBlogPostMutation();
  const updateMutation = useUpdateBlogPostMutation();

  const posts = data?.results ?? [];

  const publishDraft = async (post: AdminBlogPost) => {
    try {
      await updateMutation.mutateAsync({
        id: post.id,
        payload: { status: "PUBLISHED" },
      });
      toast.success(
        "Post published. It may take up to a few minutes to appear on the homepage.",
      );
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not publish post.");
    }
  };

  const remove = async (post: AdminBlogPost) => {
    const confirmed = await fleetConfirm({
      title: "Delete this post?",
      text: `“${post.title}” will be removed permanently.`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
      icon: "warning",
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted.");
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not delete post.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm ff-muted">
          Manage posts shown on the{" "}
          <Link
            href={AppRoutesPaths.blog.index}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            public blog
          </Link>{" "}
          and the homepage blog section.
        </p>
        <Link
          href={AppRoutesPaths.dashboard.admin.blogAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Add blog
        </Link>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold ff-heading">All posts</h3>
        {isLoading ? <LoadingState /> : null}
        {isError ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {getErrorDetail(error) ?? "Could not load posts."}
          </p>
        ) : null}
        {!isLoading && !isError && posts.length === 0 ? (
          <p className="text-sm ff-muted">
            No posts yet.{" "}
            <Link
              href={AppRoutesPaths.dashboard.admin.blogAdd}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Create your first post
            </Link>
            .
          </p>
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
                        {post.status === "DRAFT" ? (
                          <button
                            type="button"
                            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                            disabled={updateMutation.isPending}
                            onClick={() => void publishDraft(post)}
                          >
                            Publish
                          </button>
                        ) : null}
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
                        <Link
                          href={blogEditHref(post)}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="text-rose-600 hover:underline dark:text-rose-400"
                          disabled={deleteMutation.isPending}
                          onClick={async () => {
                            await remove(post);
                          }}
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
