import { useState, useEffect } from 'react';;
import apiClient from "../../config/api";
import { Category } from "../../types/models/product";

interface CategoryDropdownProps {
  onCategorySelect: (category: Category | null) => void;
  selectedCategory?: Category | null;
}

const CategoryDropdown = ({ onCategorySelect, selectedCategory }: CategoryDropdownProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response: any = await apiClient.getCategories(100, 1);
                const categoryList = response?.values || response?.data || [];

                setCategories(Array.isArray(categoryList) ? categoryList : []);
            } catch (err) {
                console.error('Error loading categories:', err);
                setError(err instanceof Error ? err.message : 'Failed to load categories');
                setCategories([]); // Ensure categories is always an array
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category: Category | null) => {
        onCategorySelect(category);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            {/* Dropdown Button */}
            <button
                onClick={toggleDropdown}
                style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: '#42af57',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fi-rs-apps"></i>
                    <span>
                        {selectedCategory
                            ? selectedCategory.ItmsGrpNam || selectedCategory.GroupName || 'Browse All Categories'
                            : 'Browse All Categories'
                        }
                    </span>
                </div>
                <i
                    className={`fi-rs-angle-${isOpen ? 'up' : 'down'}`}
                    style={{ fontSize: '20px' }}
                ></i>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998
                        }}
                    />

                    {/* Dropdown Content */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            zIndex: 999,
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '15px'
                        }}
                    >
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div className="spinner-border spinner-border-sm text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Loading categories...</p>
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
                                <i className="fi-rs-cross-circle"></i>
                                <p style={{ marginTop: '10px', fontSize: '14px' }}>Error loading categories</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {/* All Categories Option */}
                                <div
                                    onClick={() => handleCategoryClick(null)}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        backgroundColor: !selectedCategory ? '#f0f7ea' : 'transparent',
                                        transition: 'background-color 0.2s',
                                        fontWeight: !selectedCategory ? '600' : '500'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedCategory) return;
                                        e.currentTarget.style.backgroundColor = '#f0f7ea';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedCategory) return;
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#42af57',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}
                                        >
                                            <i className="fi-rs-apps" style={{ color: 'white' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '15px', color: '#333', fontWeight: '600' }}>
                                                All Categories
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                View all products
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px',
                                    marginTop: '15px'
                                }}>
                                    {categories && categories.length > 0 ? categories.map((category, index) => {
                                        const isSelected = selectedCategory?.ItmsGrpCod === category?.ItmsGrpCod;
                                        const categoryName = category.ItmsGrpNam || category.GroupName || 'Category';

                                        return (
                                            <div
                                                key={category.ItmsGrpCod || index}
                                                onClick={() => handleCategoryClick(category)}
                                                style={{
                                                    padding: '12px',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px',
                                                    backgroundColor: isSelected ? '#f0f7ea' : 'transparent',
                                                    transition: 'background-color 0.2s',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isSelected) return;
                                                    e.currentTarget.style.backgroundColor = '#f0f7ea';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (isSelected) return;
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div
                                                        style={{
                                                            width: '35px',
                                                            height: '35px',
                                                            backgroundColor: '#e8f7ef',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '18px',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {getCategoryIcon(categoryName)}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#333',
                                                            fontWeight: isSelected ? '600' : '500',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {categoryName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            <p>No categories found</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Helper function to get category icon based on name
const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();

    if (name.includes('milk') || name.includes('dairy') || name.includes('dairies')) {
        return '🥛';
    } else if (name.includes('wine') || name.includes('drink') || name.includes('beverage')) {
        return '🍷';
    } else if (name.includes('cloth') || name.includes('beauty')) {
        return '👕';
    } else if (name.includes('seafood') || name.includes('fish')) {
        return '🐟';
    } else if (name.includes('pet') || name.includes('toy')) {
        return '🐾';
    } else if (name.includes('fast food') || name.includes('snack')) {
        return '🍔';
    } else if (name.includes('baking') || name.includes('flour')) {
        return '🍰';
    } else if (name.includes('vegetable') || name.includes('veggie')) {
        return '🥬';
    } else if (name.includes('fruit')) {
        return '🍎';
    } else if (name.includes('bread') || name.includes('juice')) {
        return '🍞';
    } else if (name.includes('meat')) {
        return '🥩';
    } else {
        return '📦';
    }
};

export default CategoryDropdown;
