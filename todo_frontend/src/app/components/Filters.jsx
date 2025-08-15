"use client";
export default function Filters({ filters, setFilters }) {
  return (
    <div className="flex gap-4 mb-4">
      <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>

      <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}
