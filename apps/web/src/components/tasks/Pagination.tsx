/**
 * Pagination Component
 * Phase 2 Chunk 2 - Polish (T150, T152)
 *
 * Provides pagination controls for the task list
 */
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  total: number;
  limit: number;
  currentPage: number;
}

export function Pagination({ total, limit, currentPage }: PaginationProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/tasks?${params.toString()}`;
  };

  // Generate page numbers to show (e.g., 1, 2, 3, ..., 10)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) end = 4;
      if (currentPage >= totalPages - 1) start = totalPages - 3;

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-4 border-t border-notebook-line gap-4">
      <p className="text-sm text-notebook-ink-light font-inter">
        Showing <span className="font-medium text-notebook-ink">{(currentPage - 1) * limit + 1}</span> to{' '}
        <span className="font-medium text-notebook-ink">{Math.min(currentPage * limit, total)}</span> of{' '}
        <span className="font-medium text-notebook-ink">{total}</span> tasks
      </p>

      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous Button */}
        <Link
          href={createPageUrl(Math.max(1, currentPage - 1))}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-notebook-line bg-notebook-paper-white text-sm font-patrick-hand text-notebook-ink-medium hover:bg-notebook-paper-alt touch-target ${
            currentPage === 1 ? 'pointer-events-none text-notebook-ink-light opacity-50' : ''
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <Link
              key={index}
              href={createPageUrl(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-patrick-hand touch-target ${
                currentPage === page
                  ? 'z-10 bg-notebook-ink-blue border-notebook-ink-blue text-notebook-paper-white'
                  : 'bg-notebook-paper-white border-notebook-line text-notebook-ink-medium hover:bg-notebook-paper-alt'
              }`}
            >
              {page}
            </Link>
          ) : (
            <span
              key={index}
              className="relative inline-flex items-center px-4 py-2 border border-notebook-line bg-notebook-paper-white text-sm font-patrick-hand text-notebook-ink-medium"
            >
              {page}
            </span>
          )
        ))}

        {/* Next Button */}
        <Link
          href={createPageUrl(Math.min(totalPages, currentPage + 1))}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-notebook-line bg-notebook-paper-white text-sm font-patrick-hand text-notebook-ink-medium hover:bg-notebook-paper-alt touch-target ${
            currentPage === totalPages ? 'pointer-events-none text-notebook-ink-light opacity-50' : ''
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
