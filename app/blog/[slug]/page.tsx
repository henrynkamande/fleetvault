import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarketingShell from "@/components/marketing/MarketingShell";
import MarkdownBody from "@/components/marketing/MarkdownBody";
import MarketingSection from "@/components/marketing/MarketingSection";
import { resolveBlogCoverUrl } from "@/lib/blogCoverUrl";
import { fetchPublishedPost } from "@/lib/contentApi";
import { APP_NAME } from "@/lib/constants";
import { AppRoutesPaths } from "@/route/paths";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPublishedPost(slug);
    const title = post.seo_title || post.title;
    const description = post.seo_description || post.excerpt;
    const coverUrl = resolveBlogCoverUrl(post.cover_url);
    return {
      title: `${title} — ${APP_NAME}`,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: coverUrl ? [{ url: coverUrl }] : undefined,
      },
      twitter: {
        card: coverUrl ? "summary_large_image" : "summary",
        title,
        description,
        images: coverUrl ? [coverUrl] : undefined,
      },
    };
  } catch {
    return { title: `Blog — ${APP_NAME}` };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await fetchPublishedPost(slug);
  } catch {
    notFound();
  }

  const coverSrc = resolveBlogCoverUrl(post.cover_url);

  return (
    <MarketingShell>
      <MarketingSection className="py-16">
        <Link
          href={AppRoutesPaths.marketing.blog}
          className="text-sm font-semibold text-[#2f5aab] hover:underline"
        >
          ← All posts
        </Link>
        <article className="mx-auto mt-6 max-w-3xl">
          {coverSrc ? (
            <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- Blog covers can come from API media or absolute CMS URLs. */}
              <img src={coverSrc} alt="" className="aspect-[16/9] w-full object-cover" />
            </div>
          ) : null}
          <time className="text-sm text-gray-500">
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString()
              : ""}
          </time>
          <h1 className="mt-2 font-title text-4xl font-bold text-[#111827]">
            {post.title}
          </h1>
          <MarkdownBody source={post.body} />
        </article>
      </MarketingSection>
    </MarketingShell>
  );
}
