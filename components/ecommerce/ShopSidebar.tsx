import { useState } from 'react';

interface ShopSidebarProps {
    categories: any[];
    selectedCategory: any | null;
    onCategorySelect: (category: any) => void;
    suppliers: any[];
    selectedSupplier: any | null;
    onSupplierSelect: (supplier: any) => void;
    onClearAll: () => void;
}

const ShopSidebar = ({ categories, selectedCategory, onCategorySelect, suppliers, selectedSupplier, onSupplierSelect, onClearAll }: ShopSidebarProps) => {
    const [catOpen, setCatOpen] = useState(true);
    const [supOpen, setSupOpen] = useState(true);

    const hasActiveFilters = selectedCategory || selectedSupplier;

    return (
        <div className="shop-sidebar">
            <style jsx>{`
                .shop-sidebar {
                    background: #fff;
                    border-radius: 14px;
                    border: 1px solid #eee;
                    padding: 24px;
                }
                .shop-sidebar-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: #1a1a2e;
                    margin-bottom: 20px;
                    letter-spacing: -0.02em;
                }
                .shop-sidebar-filters-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #636363;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .shop-sidebar-clear {
                    font-size: 12px;
                    font-weight: 600;
                    color: #42af57;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .shop-sidebar-clear:hover { color: #2d8a3e; }
                .sidebar-section { margin-bottom: 20px; }
                .sidebar-section-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    padding: 10px 0;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #1a1a2e;
                }
                .sidebar-section-title .toggle-icon {
                    font-size: 11px;
                    color: #636363;
                    transition: transform 0.2s;
                }
                .sidebar-section-title .toggle-icon.collapsed { transform: rotate(-90deg); }
                .sidebar-category-item {
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #555;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                    margin-top: 2px;
                }
                .sidebar-category-item:hover { background: #f4f9f6; color: #42af57; }
                .sidebar-category-item.active {
                    background: #42af57;
                    color: #fff;
                    font-weight: 600;
                }
                .sidebar-supplier-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 0;
                    font-size: 13px;
                    color: #555;
                    cursor: pointer;
                }
                .sidebar-supplier-item input[type="checkbox"] {
                    accent-color: #42af57;
                    width: 16px;
                    height: 16px;
                }
                .sidebar-clear-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background: #fff;
                    color: #595959;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    justify-content: center;
                    transition: all 0.2s;
                    margin-top: 8px;
                }
                .sidebar-clear-btn:hover { border-color: #e74c3c; color: #e74c3c; }
            `}</style>

            <h3 className="shop-sidebar-title">FILTER BY</h3>

            {hasActiveFilters && (
                <div className="shop-sidebar-filters-label">
                    <span>NO ACTIVE FILTERS</span>
                    <button className="shop-sidebar-clear" onClick={onClearAll}>Clear All</button>
                </div>
            )}

            {/* Categories */}
            <div className="sidebar-section">
                <div className="sidebar-section-title" onClick={() => setCatOpen(!catOpen)}>
                    <span>Department</span>
                    <i className={`fi-rs-angle-down toggle-icon${!catOpen ? ' collapsed' : ''}`}></i>
                </div>
                {catOpen && (
                    <div>
                        <div
                            className={`sidebar-category-item${!selectedCategory ? ' active' : ''}`}
                            onClick={() => onCategorySelect(null)}
                        >
                            All Products
                        </div>
                        {categories?.map((cat) => (
                            <div
                                key={cat.ItmsGrpCod || cat.number}
                                className={`sidebar-category-item${selectedCategory?.ItmsGrpCod === cat.ItmsGrpCod ? ' active' : ''}`}
                                onClick={() => onCategorySelect(cat)}
                            >
                                {cat.ItmsGrpNam || cat.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Suppliers */}
            {suppliers && suppliers.length > 0 && (
                <div className="sidebar-section">
                    <div className="sidebar-section-title" onClick={() => setSupOpen(!supOpen)}>
                        <span>Brand</span>
                        <i className={`fi-rs-angle-down toggle-icon${!supOpen ? ' collapsed' : ''}`}></i>
                    </div>
                    {supOpen && (
                        <div>
                            {suppliers.map((sup) => (
                                <label key={sup.slug} className="sidebar-supplier-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedSupplier?.slug === sup.slug}
                                        onChange={() => onSupplierSelect(selectedSupplier?.slug === sup.slug ? null : sup)}
                                    />
                                    {sup.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Clear All */}
            {hasActiveFilters && (
                <button className="sidebar-clear-btn" onClick={onClearAll}>
                    <i className="fi-rs-cross-small"></i>
                    Clear All Filters
                </button>
            )}
        </div>
    );
};

export default ShopSidebar;
