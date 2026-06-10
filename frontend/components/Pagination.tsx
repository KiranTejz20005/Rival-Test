interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center items-center gap-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition duration-200 cursor-pointer disabled:cursor-not-allowed shadow-sm"
      >
        Previous
      </button>
      <span className="text-sm font-medium text-neutral-550 dark:text-neutral-400">
        Page <span className="font-semibold text-neutral-900 dark:text-neutral-100">{page}</span> of <span className="font-semibold text-neutral-900 dark:text-neutral-100">{totalPages}</span>
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition duration-200 cursor-pointer disabled:cursor-not-allowed shadow-sm"
      >
        Next
      </button>
    </div>
  );
}

