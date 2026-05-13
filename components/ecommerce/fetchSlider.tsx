import { useProducts } from "../../hooks";
import BestSeller from "../sliders/BestSeller";
import Discount from "../sliders/Discount";
import Featured from "../sliders/Featured";
import NewArrival from "../sliders/NewArrivalTab";
import Related from "../sliders/Related";
import Trending from "../sliders/Trending";
import ProductSkeleton from "../elements/ProductSkeleton";

const FetchSlider = () => {
    const { products: allProducts, isReady } = useProducts();

    // These components manage their own state internally

    if (!isReady) {
        return (
            <>
                <section className="section-padding">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h3 className="section-title mb-20">Loading Products...</h3>
                            </div>
                        </div>
                        <div className="row">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="col-lg-3 col-md-4 col-12 col-sm-6">
                                    <ProductSkeleton />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Trending products={allProducts} />
            <Featured products={allProducts} />
            <BestSeller />
            <NewArrival products={allProducts} />
            <Discount />
            <Related currentProduct={null} />
        </>
    );
};

export default FetchSlider;
