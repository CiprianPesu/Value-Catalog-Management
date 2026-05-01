import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface ConceptsPaginationProps {
  page: number; // 0-based page from backend
  setPage: (page: number) => void;
  totalPages: number; // total pages from backend
  disabled?: boolean;
}

export default function ConceptsPagination({ page, setPage, totalPages, disabled = false }: ConceptsPaginationProps) {
  const first = page === 0;
  const last = page === totalPages - 1;

  // Generate UI page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages: (number | string)[] = [];
    pages.push(0); // first page (0-based)

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 4) {
      pages.push("...");
    }

    pages.push(totalPages - 1); // last page (0-based)

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="border-t p-4 flex justify-center">
      <Pagination>
        <PaginationContent>
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => !first && setPage(page - 1)}
              className={first || disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((num, index) => (
            <PaginationItem key={index}>
              {typeof num === "number" ? (
                <PaginationLink
                  isActive={num === page}
                  onClick={() => setPage(num)}
                  className={disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  {num + 1} {/* Display as 1-based */}
                </PaginationLink>
              ) : (
                <span className="px-2 cursor-default select-none">{num}</span>
              )}
            </PaginationItem>
          ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              onClick={() => !last && setPage(page + 1)}
              className={last || disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
