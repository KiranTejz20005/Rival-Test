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
    <div className="mt-8 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium text-gray-700"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm font-medium text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium text-gray-700"
      >
        Next
      </button>
    </div>
  );
}
