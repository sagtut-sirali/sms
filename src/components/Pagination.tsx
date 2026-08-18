import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  idPrefix?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 25],
  itemName = 'results',
  idPrefix = 'pagination',
}) => {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show (max 5 page buttons around current page)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#FAFBF9] border-t border-[#E0E4D9] rounded-b-2xl text-xs text-[#707969]">
      {/* Result counter & Page size selector */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-[#42473E]">
          Showing <span className="font-bold text-[#2D3329]">{startItem}</span> to{' '}
          <span className="font-bold text-[#2D3329]">{endItem}</span> of{' '}
          <span className="font-bold text-[#2D3329]">{totalItems}</span> {itemName}
        </span>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-[#CAD3C0]">
            <span className="text-[11px]">Per page:</span>
            <select
              id={`${idPrefix}-page-size`}
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-[#CAD3C0] text-[#2D3329] font-medium text-xs rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination navigation controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            id={`${idPrefix}-first-btn`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            className="p-1.5 rounded-lg border border-[#CAD3C0] bg-white text-[#42473E] hover:bg-[#E9EDE0] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            id={`${idPrefix}-prev-btn`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            className="p-1.5 rounded-lg border border-[#CAD3C0] bg-white text-[#42473E] hover:bg-[#E9EDE0] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-1.5 text-[#8A9382]">
                    ...
                  </span>
                );
              }
              const pageNum = Number(p);
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  id={`${idPrefix}-page-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-[#5C6652] text-white shadow-xs'
                      : 'bg-white border border-[#CAD3C0] text-[#42473E] hover:bg-[#E9EDE0]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            id={`${idPrefix}-next-btn`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            className="p-1.5 rounded-lg border border-[#CAD3C0] bg-white text-[#42473E] hover:bg-[#E9EDE0] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            id={`${idPrefix}-last-btn`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            className="p-1.5 rounded-lg border border-[#CAD3C0] bg-white text-[#42473E] hover:bg-[#E9EDE0] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
