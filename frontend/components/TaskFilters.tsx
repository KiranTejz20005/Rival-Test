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
  const selectClasses = "rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-sm py-2 pl-3 pr-8 focus:outline-none focus:border-neutral-300 dark:focus:border-neutral-700 transition duration-200 cursor-pointer shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.25rem_1.25rem] bg-no-repeat";

  return (
    <div className="flex flex-nowrap gap-2.5 w-max">
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

