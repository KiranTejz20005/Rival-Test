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
  const selectClasses = "rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300 transition duration-200 cursor-pointer shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700";

  return (
    <div className="flex flex-wrap gap-2.5">
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">All Statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
      
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className={selectClasses}
      >
        <option value="createdAt">Date Created</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value)}
        className={selectClasses}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}

