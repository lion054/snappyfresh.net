import { useEffect, useState } from 'react';;
import { useProducts } from "../../hooks";
import Cat1Tab from '../elements/FeaturedTab';
import Cat2Tab from '../elements/NewArrivalTab';
import Cat3Tab from '../elements/TrendingTab';

function CategoryTab() {
    const { products: allProducts, isReady } = useProducts();
    const [active, setActive] = useState("1");
    const [catAll, setCatAll] = useState<any[]>([]);
    const [cat1, setCat1] = useState<any[]>([]);
    const [cat2, setCat2] = useState<any[]>([]);
    const [cat3, setCat3] = useState<any[]>([]);

    const getRandomProducts = (products: any[], count: number = 10) => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // Set initial products when context is ready
    useEffect(() => {
        if (allProducts.length > 0 && catAll.length === 0) {
            setCatAll(getRandomProducts(allProducts, 10));
        }
    }, [allProducts]);

    const catPAll = () => {
        setCatAll(getRandomProducts(allProducts, 10));
        setActive("1");
    };

    const catP1 = () => {
        setCat1(getRandomProducts(allProducts, 10));
        setActive("2");
    };

    const catP2 = () => {
        setCat2(getRandomProducts(allProducts, 10));
        setActive("3");
    };

    const catP3 = () => {
        setCat3(getRandomProducts(allProducts, 10));
        setActive("4");
    };

    return (
        <>
            <div className="section-title style-2 wow animate__animated animate__fadeIn">
                <h3>Popular Products</h3>
                <ul className="nav nav-tabs links" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button
                            className={active === "1" ? "nav-link active" : "nav-link"}
                            onClick={catPAll}
                        >
                            All
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={active === "2" ? "nav-link active" : "nav-link"}
                            onClick={catP1}
                        >
                            Featured
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={active === "3" ? "nav-link active" : "nav-link"}
                            onClick={catP2}
                        >
                            Popular
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button
                            className={active === "4" ? "nav-link active" : "nav-link"}
                            onClick={catP3}
                        >
                            New added
                        </button>
                    </li>
                </ul>
            </div>

            {!isReady && (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading products...</p>
                </div>
            )}

            {isReady && (
                <div className="tab-content wow fadeIn animated">
                    <div className={active === "1" ? "tab-pane fade show active" : "tab-pane fade"}>
                        <div className="product-grid-4 row">
                            <Cat1Tab products={catAll} />
                        </div>
                    </div>
                    <div className={active === "2" ? "tab-pane fade show active" : "tab-pane fade"}>
                        <div className="product-grid-4 row">
                            <Cat1Tab products={cat1} />
                        </div>
                    </div>
                    <div className={active === "3" ? "tab-pane fade show active" : "tab-pane fade"}>
                        <div className="product-grid-4 row">
                            <Cat3Tab products={cat2} />
                        </div>
                    </div>
                    <div className={active === "4" ? "tab-pane fade show active" : "tab-pane fade"}>
                        <div className="product-grid-4 row">
                            <Cat2Tab products={cat3} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default CategoryTab;
