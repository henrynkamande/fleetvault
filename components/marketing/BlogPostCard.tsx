import Link from "next/link";
import { resolveBlogCoverUrl } from "@/lib/blogCoverUrl";
import { APP_NAME } from "@/lib/constants";
import type { PublicBlogPost } from "@/lib/contentApi";
import { AppRoutesPaths } from "@/route/paths";

function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type BlogPostCardProps = {
  post: PublicBlogPost;
  linkLabel?: "Read more" | "Read article";
};

export default function BlogPostCard({ post, linkLabel = "Read article" }: BlogPostCardProps) {
  const href = AppRoutesPaths.blog.post(post.slug);
  const cover = resolveBlogCoverUrl(post.cover_url);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-[#2f5aab]/30 hover:shadow-md">
      {cover ? (
        <Link href={href} className="block aspect-[16/9] w-full overflow-hidden bg-gray-100">
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link
          href={href}
          className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
          aria-hidden
        >
          <span className="font-title text-sm font-semibold uppercase tracking-wide text-slate-400">
            {APP_NAME}
          </span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-medium text-gray-500" dateTime={post.published_at ?? undefined}>
          {formatPostDate(post.published_at)}
        </time>
        <h2 className="mt-2 font-title text-lg font-bold leading-snug text-[#111827] md:text-xl">
          <Link href={href} className="transition hover:text-[#2f5aab]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-700 line-clamp-3">
            {post.excerpt}
          </p>
        ) : (
          <p className="mt-2 flex-1 text-sm text-gray-500">No excerpt.</p>
        )}
        <Link
          href={href}
          className="mt-4 inline-flex text-sm font-semibold text-[#2f5aab] hover:underline"
        >
          {linkLabel}
        </Link>
      </div>
    </article>
  );
}
