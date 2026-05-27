import axios from "axios";
import { getApiOrigin } from "@/lib/apiOrigin";

const contentBase = `${getApiOrigin()}/content/api`;

const publicClient = axios.create({
  baseURL: contentBase.replace(/\/$/, ""),
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json; version=1.0",
  },
});

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string;
  published_at: string | null;
  seo_title?: string;
  seo_description?: string;
};

export type PublicBlogPostDetail = PublicBlogPost & {
  body: string;
};

export async function fetchPublishedPosts(limit = 6) {
  const res = await publicClient.get<{ count: number; results: PublicBlogPost[] }>(
    "/posts/",
    { params: { status: "published", limit, page: 1 } },
  );
  return res.data.results;
}

export async function fetchPublishedPost(slug: string) {
  const res = await publicClient.get<PublicBlogPostDetail>(`/posts/${slug}/`);
  return res.data;
}

export async function fetchAllPublishedPosts(page = 1, limit = 12) {
  const res = await publicClient.get<{ count: number; results: PublicBlogPost[] }>(
    "/posts/",
    { params: { status: "published", limit, page } },
  );
  return res.data;
}
