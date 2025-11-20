import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@top-github-repos/api/types/repos";

interface PaginationProps {
  pagination: PaginationMeta;
  basePath: string;
  className?: string;
  language?: string;
  search?: string;
}

export default function Pagination({ pagination, basePath, className, language, search }: PaginationProps) {
  const { currentPage, totalPages, hasNext, hasPrevious } = pagination;

  // Don't show pagination if only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set('page', page.toString());
    }
    if (language) {
      params.set('language', language);
    }
    if (search) {
      params.set('search', search);
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <Link
        to={getPageUrl(currentPage - 1)}
        disabled={!hasPrevious}
        aria-label="Go to previous page"
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Previous</span>
          <span className="hidden sm:inline">Previous</span>
        </Button>
      </Link>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-muted-foreground"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Link
              key={page}
              to={getPageUrl(page)}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-w-[2.5rem]",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                {page}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      <Link
        to={getPageUrl(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Go to next page"
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          className="gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sr-only">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </nav>
  );
}

