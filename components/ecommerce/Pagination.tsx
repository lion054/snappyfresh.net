interface PaginationComponentProps {
    prev: () => void;
    currentPage: number;
    getPaginationGroup: number[];
    next: () => void;
    pages: number;
    handleActive: (page: number) => void;
}

function Pagination({ prev, currentPage, getPaginationGroup, next, pages, handleActive }: PaginationComponentProps) {
    if (!getPaginationGroup || getPaginationGroup.length <= 0) return null;

    return (
        <div className="sf-pagination">
            {/* Prev */}
            <button className="sf-pg-btn sf-pg-arrow" onClick={prev} disabled={currentPage === 1} aria-label="Previous page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>

            {/* Page numbers */}
            {getPaginationGroup.map((item) => (
                <button
                    key={item}
                    className={`sf-pg-btn${currentPage === item ? ' sf-pg-btn--active' : ''}`}
                    onClick={() => handleActive(item)}
                >
                    {item}
                </button>
            ))}

            {/* Next */}
            <button className="sf-pg-btn sf-pg-arrow" onClick={next} disabled={currentPage >= pages} aria-label="Next page">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            {/* Page indicator */}
            <span className="sf-pg-info">Page {currentPage} of {pages}</span>

            <style jsx>{`
                .sf-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 32px 0 48px;
                    flex-wrap: wrap;
                }
                .sf-pg-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: 1.5px solid #e8e8e8;
                    background: #fff;
                    color: #555;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    padding: 0;
                }
                .sf-pg-btn:hover:not(:disabled):not(.sf-pg-btn--active) {
                    background: #f5f5f5;
                    border-color: #ccc;
                    color: #1a1a2e;
                }
                .sf-pg-btn--active {
                    background: #1b2e28;
                    color: #fff;
                    border-color: #1b2e28;
                }
                .sf-pg-arrow {
                    color: #333;
                }
                .sf-pg-arrow:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .sf-pg-info {
                    font-size: 13px;
                    color: #636363;
                    margin-left: 12px;
                    font-weight: 500;
                }
                @media (max-width: 480px) {
                    .sf-pagination { gap: 4px; padding: 24px 0 36px; }
                    .sf-pg-btn { min-width: 36px; height: 36px; font-size: 13px; border-radius: 8px; }
                    .sf-pg-info { display: none; }
                }
            `}</style>
        </div>
    );
}

export default Pagination;
