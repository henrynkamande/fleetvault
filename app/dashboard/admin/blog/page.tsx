export default function AdminBlogPage() {
  return (
    <p className="text-slate-600 dark:text-slate-400">
      Create and edit posts via{" "}
      <code className="text-sm">/content/api/admin/posts/</code> with your
      platform admin JWT. Public posts power the marketing blog at{" "}
      <code className="text-sm">/blog</code>.
    </p>
  );
}
