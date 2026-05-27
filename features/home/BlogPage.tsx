import Link from "next/link";
import MarketingPageHero from "@/components/marketing/MarketingPageHero";
import { fetchAllPublishedPosts } from "@/lib/contentApi";
import { APP_NAME } from "@/lib/constants";
import { MARKETING_CONTAINER } from "@/lib/marketingLayout";
import { AppRoutesPaths } from "@/route/paths";

export const BLOG_PAGE_REVALIDATE = 300;

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof fetchAllPublishedPosts>>["results"] = [];
  let apiUnavailable = false;

  try {
    const data = await fetchAllPublishedPosts(1, 24);
    posts = data.results;
  } catch {
    apiUnavailable = true;
  }

  return (
    <>
      <MarketingPageHero
        eyebrow="Blog"
        title="Insights for fleet operators"
        description={`Product updates, operations tips, and stories from teams using ${APP_NAME}.`}
        centered
      />

      <section className="py-14">
        <div className={MARKETING_CONTAINER}>
          {posts.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <p className="text-gray-700">
                {apiUnavailable
                  ? "We could not reach the blog API. Start the backend on port 8000 and refresh this page."
                  : "No published posts yet. Check back soon."}
              </p>
            </div>
          ) : (
            <ul className="space-y-10">
              {posts.map((post) => (
                <li key={post.id}>
                  <article>
                    <time className="text-sm font-medium text-gray-500">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </time>
                    <h2 className="mt-2 font-title text-2xl font-bold text-[#111827] md:text-3xl">
                      <Link
                        href={AppRoutesPaths.blog.post(post.slug)}
                        className="transition hover:text-[#2f5aab]"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 max-w-3xl text-gray-700 leading-relaxed">{post.excerpt}</p>
                    ) : null}
                    <Link
                      href={AppRoutesPaths.blog.post(post.slug)}
                      className="mt-4 inline-block text-sm font-semibold text-[#2f5aab] hover:underline"
                    >
                      Read article
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
