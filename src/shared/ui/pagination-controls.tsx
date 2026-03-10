type PaginationControlsProps = {
  currentPage: number;
  itemLabel: string;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index);
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}

export function PaginationControls({
  currentPage,
  itemLabel,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-500">
        {startItem}-{endItem} / {totalItems.toLocaleString("ko-KR")}
        {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage === 1}
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
        >
          이전
        </button>

        {visiblePages.map((page) => (
          <button
            className={
              page === currentPage
                ? "rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-line px-3 py-2 text-sm font-medium text-slate-700"
            }
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="rounded-xl border border-line px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage === totalPages}
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}
