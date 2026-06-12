import Link from "next/link";
import BlogPostCard from "@/components/marketing/BlogPostCard";
import MarketingSection from "@/components/marketing/MarketingSection";
import { fetchPublishedPosts } from "@/lib/contentApi";
import { AppRoutesPaths } from "@/route/paths";

export const BLOG_PREVIEW_REVALIDATE = 300;

export default async function BlogPreview() {
  let posts: Awaited<ReturnType<typeof fetchPublishedPosts>> = [];
  let apiUnavailable = false;
  try {
    posts = await fetchPublishedPosts(6);
  } catch {
    posts = [];
    apiUnavailable = true;
  }

  return (
    <MarketingSection id="blog" className="bg-[#F9F9F9] py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-title text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-[#111827]">
          From the blog
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-700">
          Product updates and fleet operations insights.
        </p>
      </div>
      {posts.length === 0 ? (
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-700">
            {apiUnavailable
              ? "Blog posts could not be loaded. Make sure the API is running on port 8000, then refresh."
              : "New articles will appear here once they are published."}
          </p>
          <Link
            href={AppRoutesPaths.blog.index}
            className="mt-4 inline-block text-sm font-semibold text-[#2f5aab] hover:underline"
          >
            Go to blog
          </Link>
        </div>
      ) : (
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} linkLabel="Read more" />
        ))}
      </div>
      )}
      <p className="mt-8 text-center">
        <Link
          href={AppRoutesPaths.blog.index}
          className="text-sm font-semibold text-[#2f5aab] hover:underline"
        >
          View all posts
        </Link>
      </p>
    </MarketingSection>
  );
}
