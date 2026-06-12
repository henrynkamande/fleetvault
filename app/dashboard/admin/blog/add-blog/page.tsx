import { Suspense } from "react";
import AdminBlogForm from "@/features/dashboard/admin/AdminBlogForm";

export default function AdminBlogAddPage() {
  return (
    <Suspense fallback={<p className="text-sm ff-muted">Loading…</p>}>
      <AdminBlogForm />
    </Suspense>
  );
}
