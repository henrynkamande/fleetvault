type SpinnerSize = "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-2",
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div
      className={`animate-spin rounded-full border-indigo-200 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingState({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div className={`flex justify-center py-8 ${className}`} role="status">
      <LoadingSpinner size={size} />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function LoadingCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex justify-center rounded-2xl border border-gray-200 bg-white py-12 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      role="status"
    >
      <LoadingSpinner />
      <span className="sr-only">Loading</span>
    </div>
  );
}
