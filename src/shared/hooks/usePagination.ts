import { useMemo, useState, useCallback } from "react";

export function getPageNumbers(
  totalPages: number,
  currentPage: number,
): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  const middle: number[] = [];
  for (let i = start; i <= end; i++) {
    middle.push(i);
  }

  return [
    1,
    ...(currentPage > 3 ? (["ellipsis"] as const) : []),
    ...middle,
    ...(currentPage < totalPages - 2 ? (["ellipsis"] as const) : []),
    totalPages,
  ];
}

export function usePagination<T>(items: T[], itemsPerPage: number) {
  const [page, setPage] = useState(1);
  const resetPage = useCallback(() => setPage(1), []);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const slice = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, safePage, itemsPerPage]);

  const pageNumbers = useMemo(
    () => getPageNumbers(totalPages, safePage),
    [totalPages, safePage],
  );

  return {
    page: safePage,
    setPage,
    totalPages,
    slice,
    pageNumbers,
    resetPage,
  };
}
