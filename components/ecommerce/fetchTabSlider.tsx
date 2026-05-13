import { useEffect, useState } from 'react';;
import Link from 'next/link';
import { useProducts } from "../../hooks";
import FeaturedSlider from "../sliders/Featured";
import NewArrivalTabSlider from "../sliders/NewArrivalTab";
import TrendingSlider from "../sliders/Trending";

function FeatchTabSlider() {
    const { products: allProducts, isReady } = useProducts();
    const [active, setActive] = useState("1");
    const [featured, setFeatured] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [newArrival, setNewArrival] = useState<any[]>([]);

    // Helper function to get random products, favoring Yomilk brand
    const getRandomProducts = (products: any[], count: number = 10) => {
        const yomilkProducts = products.filter(p =>
            p.itemName?.toLowerCase().includes('yomilk') ||
            p.itemCode?.toLowerCase().includes('yomilk')
        );
        const otherProducts = products.filter(p =>
            !p.itemName?.toLowerCase().includes('yomilk') &&
            !p.itemCode?.toLowerCase().includes('yomilk')
        );

        const yomilkCount = Math.min(7, yomilkProducts.length);
        const othersCount = count - yomilkCount;

        const selectedYomilk = [...yomilkProducts].sort(() => 0.5 - Math.random()).slice(0, yomilkCount);
        const selectedOthers = [...otherProducts].sort(() => 0.5 - Math.random()).slice(0, othersCount);

        const combined = [...selectedYomilk, ...selectedOthers];
        return combined.sort(() => 0.5 - Math.random());
    };

    // Set initial featured when products become available
    useEffect(() => {
        if (allProducts.length > 0 && featured.length === 0) {
            setFeatured(getRandomProducts(allProducts, 10));
        }
    }, [allProducts]);

    const featuredProduct = () => {
        setFeatured(getRandomProducts(allProducts, 10));
        setActive("1");
    };

    const trendingProduct = () => {
        setTrending(getRandomProducts(allProducts, 10));
        setActive("2");
    };

    const newArrivalProduct = () => {
        setNewArrival(getRandomProducts(allProducts, 10));
        setActive("3");
    };

    return (
        <>
            <div className="section-title wow animate__animated animate__fadeIn">
                <h3 className="">Daily Best Sells</h3>

                <ul className="nav nav-tabs links" id="myTab-1" role="tablist">
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

            {!isReady && (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading products...</p>
                </div>
            )}

            {isReady && (
                <div className="row">
                    <div className="col-lg-3 d-none d-lg-flex wow animate__animated animate__fadeIn">
                        <div className="banner-img style-2">
                            <div className="banner-text">
                                <h2 className="mb-100">Bring nature into your home</h2>
                                <Link href="/store" className="btn btn-xs">
                                    Shop Now <i className="fi-rs-arrow-small-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-9 col-md-12">
                        <div className="tab-content wow fadeIn animated" id="myTabContent">
                            <div className={active === "1" ? "tab-pane fade show active" : "tab-pane fade"}>
                                <div className="carausel-4-columns-cover card-product-small arrow-center position-relative">
                                    <FeaturedSlider products={featured} />
                                </div>
                            </div>
                            <div className={active === "2" ? "tab-pane fade show active" : "tab-pane fade"}>
                                <div className="carausel-4-columns-cover card-product-small arrow-center position-relative">
                                    <TrendingSlider products={trending} />
                                </div>
                            </div>
                            <div className={active === "3" ? "tab-pane fade show active" : "tab-pane fade"}>
                                <div className="carausel-4-columns-cover card-product-small arrow-center position-relative">
                                    <NewArrivalTabSlider products={newArrival} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default FeatchTabSlider;
