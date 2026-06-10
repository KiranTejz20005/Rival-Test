interface TaskFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  sortBy: string;
  sortOrder: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: string) => void;
}

export default function TaskFilters({
  statusFilter,
  priorityFilter,
  sortBy,
  sortOrder,
  onStatusChange,
  onPriorityChange,
  onSortByChange,
  onSortOrderChange
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      >
        <option value="">All Statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      >
        <option value="createdAt">Date Created</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>
      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
