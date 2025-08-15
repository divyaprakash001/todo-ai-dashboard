export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="h-6 bg-gray-300 rounded w-2/4"></div>
      <div className="h-6 bg-gray-300 rounded w-full"></div>
    </div>
  );
}
