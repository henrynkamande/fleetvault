import MarketingPageHero from "@/components/marketing/MarketingPageHero";
import BlogPostCard from "@/components/marketing/BlogPostCard";
import { fetchAllPublishedPosts } from "@/lib/contentApi";
import { APP_NAME } from "@/lib/constants";
import { MARKETING_CONTAINER } from "@/lib/marketingLayout";

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} linkLabel="Read article" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
