"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useAdminBlogPosts,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
} from "@/hooks/queries/useBlogAdmin";
import { getErrorDetail } from "@/lib/apiErrors";
import { resolveBlogCoverUrl } from "@/lib/blogCoverUrl";
import { uploadBlogCoverImage, type BlogPostStatus } from "@/lib/contentApi";
import { AppRoutesPaths } from "@/route/paths";

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
  seo_title: "",
  seo_description: "",
  slug: "",
  excerpt: "",
  body: "",
  cover_url: "",
  status: "PUBLISHED" as BlogPostStatus,
};

export default function AdminBlogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const { data, isLoading: loadingPosts } = useAdminBlogPosts({ page: 1, page_size: 100 });
  const editing = useMemo(
    () => (editId ? data?.results?.find((p) => p.id === editId) ?? null : null),
    [data?.results, editId],
  );

  const createMutation = useCreateBlogPostMutation();
  const updateMutation = useUpdateBlogPostMutation();
  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const timer = window.setTimeout(() => {
    if (!editId) {
      setForm(emptyForm);
      setSlugTouched(false);
      return;
    }
    if (editing) {
      setForm({
        title: editing.title,
        seo_title: editing.seo_title ?? "",
        seo_description: editing.seo_description ?? "",
        slug: editing.slug,
        excerpt: editing.excerpt ?? "",
        body: editing.body,
        cover_url: editing.cover_url ?? "",
        status: editing.status,
      });
      setSlugTouched(true);
    }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [editId, editing]);

  const onCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Cover must be a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be 5 MB or smaller.");
      return;
    }
    setCoverUploading(true);
    try {
      const cover_url = await uploadBlogCoverImage(file);
      setForm((f) => ({ ...f, cover_url }));
      toast.success("Cover image uploaded.");
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not upload cover image.");
    } finally {
      setCoverUploading(false);
    }
  };

  const effectiveSlug = useMemo(() => {
    if (slugTouched && form.slug.trim()) return form.slug.trim();
    if (form.title.trim()) return slugify(form.title);
    return "";
  }, [form.slug, form.title, slugTouched]);

  const savePost = async (nextStatus: BlogPostStatus) => {
    const title = form.title.trim();
    const slug = effectiveSlug;
    const body = form.body.trim();
    const metaTitle = form.seo_title.trim();
    const metaDescription = form.seo_description.trim();
    if (!title || !slug || !body) {
      toast.error("Title, slug, and body are required.");
      return;
    }
    const cover = form.cover_url.trim();
    const payload = {
      title,
      slug,
      body,
      excerpt: form.excerpt.trim(),
      status: nextStatus,
      seo_title: metaTitle || title,
      seo_description: (metaDescription || form.excerpt.trim()).slice(0, 500),
      ...(cover ? { cover_url: cover } : { cover_url: "" }),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success(
          nextStatus === "PUBLISHED"
            ? "Post published. It may take up to a few minutes to appear on the homepage."
            : "Draft saved.",
        );
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(
          nextStatus === "PUBLISHED"
            ? "Post published. It may take up to a few minutes to appear on the homepage."
            : "Post saved as draft.",
        );
      }
      router.push(AppRoutesPaths.dashboard.admin.blog);
    } catch (err) {
      toast.error(getErrorDetail(err) ?? "Could not save post.");
    }
  };

  if (editId && loadingPosts) {
    return <p className="text-sm ff-muted">Loading post…</p>;
  }

  if (editId && !loadingPosts && !editing) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-600 dark:text-rose-400">Post not found.</p>
        <Link
          href={AppRoutesPaths.dashboard.admin.blog}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={AppRoutesPaths.dashboard.admin.blog}
        className="inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← All posts
      </Link>

      <p className="text-sm ff-muted">
        Write posts in Markdown. Published posts appear on the{" "}
        <Link
          href={AppRoutesPaths.blog.index}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          public blog
        </Link>{" "}
        and the homepage blog section.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void savePost("PUBLISHED");
        }}
        className="ff-card max-w-3xl space-y-4"
      >
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
          <span className="ff-muted">Meta title</span>
          <input
            className="ff-dashboard-select mt-1 w-full"
            value={form.seo_title}
            onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
            placeholder={form.title || "Search result/browser title"}
            maxLength={300}
          />
          <span className="mt-1 block text-xs ff-muted">
            Used for the browser tab and search/social preview title. Falls back to the post title.
          </span>
        </label>
        <label className="block text-sm">
          <span className="ff-muted">Meta description</span>
          <textarea
            className="ff-dashboard-select mt-1 min-h-[72px] w-full"
            value={form.seo_description}
            onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
            placeholder="Short SEO summary for search results and link previews"
            maxLength={500}
            rows={2}
          />
          <span className="mt-1 block text-xs ff-muted">
            Keep it clear and specific. Falls back to the excerpt when empty.
          </span>
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
        <div className="block text-sm">
          <span className="ff-muted">Cover image (optional)</span>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium ff-muted hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
              {coverUploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={coverUploading || saving}
                onChange={onCoverFileChange}
              />
            </label>
            {form.cover_url ? (
              <button
                type="button"
                className="text-sm text-rose-600 hover:underline dark:text-rose-400"
                disabled={coverUploading || saving}
                onClick={() => setForm((f) => ({ ...f, cover_url: "" }))}
              >
                Remove cover
              </button>
            ) : null}
          </div>
          {resolveBlogCoverUrl(form.cover_url) ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- Admin previews should match the backend media URL exactly. */}
              <img
                src={resolveBlogCoverUrl(form.cover_url)!}
                alt=""
                className="mt-3 max-h-40 w-auto rounded-lg border border-slate-200 object-cover dark:border-slate-600"
              />
            </>
          ) : (
            <p className="mt-2 text-xs ff-muted">JPEG, PNG, WebP, or GIF — max 5 MB.</p>
          )}
        </div>
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
        {editing ? (
          <p className="text-sm ff-muted">
            Current status:{" "}
            <span className="font-medium ff-heading">
              {editing.status === "PUBLISHED" ? "Published" : "Draft"}
            </span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || coverUploading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Publish"}
          </button>
          <button
            type="button"
            disabled={saving || coverUploading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium ff-muted hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-60"
            onClick={() => void savePost("DRAFT")}
          >
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <Link
            href={AppRoutesPaths.dashboard.admin.blog}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium ff-muted hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
