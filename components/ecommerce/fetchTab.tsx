import { useEffect, useState } from 'react';;
import { useProducts } from "../../hooks";
import FeaturedTab from './../elements/FeaturedTab';
import NewArrivalTab from './../elements/NewArrivalTab';
import TrendingTab from './../elements/TrendingTab';

function FeatchTab() {
    const { products: allProducts } = useProducts();
    const [active, setActive] = useState("1");
    const [featured, setFeatured] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [newArrival, setNewArrival] = useState<any[]>([]);

    useEffect(() => {
        if (allProducts.length > 0 && featured.length === 0) {
            const randomProducts = [...allProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 10);
            setFeatured(randomProducts);
        }
    }, [allProducts]);

    const featuredProduct = () => {
        const randomProducts = [...allProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
        setFeatured(randomProducts);
        setActive("1");
    };

    const trendingProduct = () => {
        const randomProducts = [...allProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
        setTrending(randomProducts);
        setActive("2");
    };

    const newArrivalProduct = () => {
        const randomProducts = [...allProducts]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
        setNewArrival(randomProducts);
        setActive("3");
    };

    return (
        <>
            <div className="section-title style-2 wow animate__animated animate__fadeIn">
            <h3>Popular Products</h3>
                <ul className="nav nav-tabs links" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className={active === "1" ? "nav-link active" : "nav-link"} onClick={featuredProduct}>
                            Featured
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className={active === "2" ? "nav-link active" : "nav-link"} onClick={trendingProduct}>
                            Popular
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className={active === "3" ? "nav-link active" : "nav-link"} onClick={newArrivalProduct}>
                            New added
                        </button>
                    </li>
                </ul>
            </div>

            <div className="tab-content wow fadeIn animated">
                <div className={active === "1" ? "tab-pane fade show active" : "tab-pane fade"}>
                    <div className="product-grid-4 row">
                        <FeaturedTab products={featured} />
                    </div>
                </div>
                <div className={active === "2" ? "tab-pane fade show active" : "tab-pane fade"}>
                    <div className="product-grid-4 row">
                        <TrendingTab products={trending} />
                    </div>
                </div>
                <div className={active === "3" ? "tab-pane fade show active" : "tab-pane fade"}>
                    <div className="product-grid-4 row">
                        <NewArrivalTab products={newArrival} />
                    </div>
                </div>
            </div>
        </>
    );
}
export default FeatchTab;
