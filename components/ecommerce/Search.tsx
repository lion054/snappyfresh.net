import { useRouter } from "next/router";
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useProducts } from "../../hooks";
import { useCategories } from "../../hooks/useCategories";

const Search = () => {
    const { products: allProducts, isReady } = useProducts();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

    // Autocomplete state
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const router = useRouter();

    const fetchAutocompleteSuggestions = useCallback((query: string) => {
        if (!query || query.trim().length < 2 || !isReady) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const queryLower = query.toLowerCase().trim();
        const filteredProducts = allProducts.filter(product => {
            const name = (product.ItemName || product.itemName || product.name || '').toLowerCase();
            const desc = (product.description || product.u_ONA_Description || '').toLowerCase();
            return name.includes(queryLower) || desc.includes(queryLower);
        });

        const uniqueSuggestions: any[] = [];
        const seen = new Set();

        filteredProducts.forEach((product: any) => {
            const name = product.ItemName || product.itemName || product.name;
            if (name && !seen.has(name.toLowerCase())) {
                seen.add(name.toLowerCase());
                uniqueSuggestions.push({
                    id: product.ItemCode || product.itemCode,
                    name: name,
                    type: 'product',
                    price: product.price || 0
                });
            }
        });

        setSuggestions(uniqueSuggestions.slice(0, 8));
        setShowSuggestions(uniqueSuggestions.length > 0);
        setSelectedSuggestionIndex(-1);
    }, [allProducts, isReady]);

    const handleInputChange = useCallback((e: any) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedSuggestionIndex(-1);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchAutocompleteSuggestions(value);
        }, 300);
    }, [fetchAutocompleteSuggestions]);

    const handleKeyDown = (e: any) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    selectSuggestion(suggestions[selectedSuggestionIndex]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    const selectSuggestion = (suggestion: any) => {
        setSearchTerm(suggestion.name);
        setShowSuggestions(false);
        setSuggestions([]);

        router.push({
            pathname: "/store",
            query: {
                search: suggestion.name,
                ...(selectedCategory && { category: selectedCategory })
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const query: any = {
            search: searchTerm.trim(),
        };

        if (selectedCategory) {
            query.category = selectedCategory;
        }

        if (query.search) {
            router.push({
                pathname: "/store",
                query,
            });
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    return (
        <>
            <style>{`
                .search-bar-snappy {
                    display: flex;
                    align-items: stretch;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: box-shadow 0.3s ease;
                    width: 100%;
                }

                .search-bar-snappy:focus-within {
                    box-shadow: 0 4px 16px rgba(66, 175, 87, 0.15) !important;
                }

                .search-bar-snappy select {
                    max-width: 180px;
                    background: #f8f9fa;
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    padding: 12px 16px;
                    cursor: pointer;
                    border: none;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .search-bar-snappy select:focus {
                    outline: none;
                    background: #f0f2f5 !important;
                }

                .search-bar-snappy select:hover {
                    background: #eff0f3;
                }

                .search-bar-snappy input {
                    flex-grow: 1;
                    background: white;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    padding: 12px 16px 12px 48px;
                    color: #333;
                }

                .search-bar-snappy input::placeholder {
                    color: #636363;
                }

                .search-bar-snappy input:focus {
                    outline: none;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #636363;
                    font-size: 18px;
                    pointer-events: none;
                }

                .search-button-snappy {
                    background: #42af57;
                    border: none;
                    border-radius: 0;
                    padding: 10px 28px;
                    font-weight: 600;
                    color: white;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 6px rgba(66, 175, 87, 0.3);
                    cursor: pointer;
                    margin-right: 8px;
                    margin-top: 0;
                    margin-bottom: 0;
                }

                .search-button-snappy:hover {
                    background: #3d9332 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 10px rgba(66, 175, 87, 0.4) !important;
                }

                .search-button-snappy:active {
                    transform: translateY(0);
                }
            `}</style>

            <form className="search-bar-snappy" style={{ position: "relative", display: "flex", alignItems: "stretch" }}>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by category"
                    style={{
                        maxWidth: "180px",
                        background: "#f8f9fa",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333",
                        padding: "12px 16px",
                        cursor: "pointer",
                        border: "none",
                        outline: "none"
                    }}>
                    <option value="">All Categories</option>
                    {categories && categories.length > 0 ? (
                        categories.map((cat: any) => (
                            <option key={cat.ItmsGrpCod} value={cat.ItmsGrpCod}>
                                {cat.ItmsGrpNam || cat.GroupName || 'Category'}
                            </option>
                        ))
                    ) : (
                        <option disabled>{categoriesLoading ? 'Loading categories...' : (categoriesError ? 'Unable to load categories' : 'No categories available')}</option>
                    )}
                </select>

                <div style={{ position: "relative", flexGrow: 1, display: "flex", alignItems: "center", background: "white" }} ref={suggestionsRef}>
                    <i className="fi-rs-search" style={{
                        position: "absolute",
                        left: "16px",
                        color: "#999",
                        fontSize: "18px",
                        pointerEvents: "none"
                    }}></i>
                    <input
                        value={searchTerm}
                        onKeyDown={handleKeyDown}
                        onChange={handleInputChange}
                        onFocus={() => searchTerm && suggestions.length > 0 && setShowSuggestions(true)}
                        type="text"
                        placeholder="Search for fresh groceries, dairy, meat..."
                        autoComplete="off"
                        role="combobox"
                        aria-label="Search products"
                        aria-expanded={showSuggestions && suggestions.length > 0}
                        aria-autocomplete="list"
                        aria-controls="search-suggestions"
                        aria-activedescendant={selectedSuggestionIndex >= 0 ? `suggestion-${selectedSuggestionIndex}` : undefined}
                        style={{
                            fontSize: "14px",
                            padding: "12px 120px 12px 48px",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            width: "100%",
                            color: "#333"
                        }}
                    />
                    <button
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSearch();
                        }}
                        className="search-button-snappy"
                        style={{
                            position: "absolute",
                            right: "8px",
                            background: "#42af57",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 28px",
                            fontWeight: "600",
                            color: "white",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 6px rgba(66, 175, 87, 0.3)",
                            cursor: "pointer"
                        }}
                    >
                        Search
                    </button>

                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            id="search-suggestions"
                            role="listbox"
                            aria-label="Search suggestions"
                            style={{
                            position: "absolute",
                            top: "100%",
                            left: "0",
                            right: "0",
                            background: "white",
                            border: "1px solid #e0e0e0",
                            borderTop: "none",
                            borderRadius: "0 0 8px 8px",
                            maxHeight: "300px",
                            overflowY: "auto",
                            zIndex: 1000,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                        }}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    id={`suggestion-${index}`}
                                    role="option"
                                    aria-selected={selectedSuggestionIndex === index}
                                    onClick={() => selectSuggestion(suggestion)}
                                    style={{
                                        padding: "10px 16px",
                                        borderBottom: "1px solid #f0f0f0",
                                        cursor: "pointer",
                                        background: selectedSuggestionIndex === index ? "#f5f5f5" : "white",
                                        transition: "background 0.2s ease",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: "13px",
                                            color: "#333",
                                            fontWeight: "500",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        }}>
                                            <i className="fi-rs-search" style={{
                                                marginRight: "8px",
                                                color: "#42af57",
                                                fontSize: "12px"
                                            }}></i>
                                            {suggestion.name}
                                        </div>
                                    </div>
                                    {suggestion.price > 0 && (
                                        <div style={{
                                            fontSize: "12px",
                                            color: "#999",
                                            marginLeft: "8px",
                                            whiteSpace: "nowrap"
                                        }}>
                                            ${suggestion.price.toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </>
    );
};

export default Search;
