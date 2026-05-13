import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SingleProduct from "../ecommerce/SingleProduct";
import { useCrossSells } from "../../hooks/useCrossSells";
import { useCartCrossSells } from "../../hooks/useCrossSells";

/**
 * CrossSellSlider - "You May Also Like" section
 *
 * Two modes:
 * - Product mode: pass `currentProduct` prop (for product detail page)
 * - Cart mode: pass `cartItems` prop (for cart page)
 */
const CrossSellSlider = ({ currentProduct, cartItems, title = "You May Also Like" }: { currentProduct?: any; cartItems?: any[]; title?: string }) => {
    // Choose the right hook based on props
    const productResult = useCrossSells(cartItems ? null : currentProduct);
    const cartResult = useCartCrossSells(cartItems || []);

    const { data: crossSells, isLoading } = cartItems ? cartResult : productResult;

    if (isLoading || !crossSells || crossSells.length === 0) return null;

    return (
        <div className="row mt-40 mb-30">
            <div className="col-12">
                <h3 className="section-title style-1 mb-30">{title}</h3>
            </div>
            <div className="col-12">
                <div className="row related-products position-relative">
                    <Swiper
                        modules={[Navigation]}
                        slidesPerView={1.5}
                        spaceBetween={10}
                        breakpoints={{
                            480: { slidesPerView: 2, spaceBetween: 12 },
                            768: { slidesPerView: 3, spaceBetween: 20 },
                            1024: { slidesPerView: 4, spaceBetween: 30 },
                        }}
                        navigation={{
                            prevEl: ".crosssell_prev",
                            nextEl: ".crosssell_next",
                        }}
                        className="custom-class"
                    >
                        {crossSells.map((product, i) => (
                            <SwiperSlide key={product.ItemCode || product.itemCode || i}>
                                <SingleProduct product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="slider-arrow slider-arrow-2 carausel-6-columns-arrow">
                        <span className="slider-btn slider-prev slick-arrow crosssell_prev">
                            <i className="fi-rs-angle-left"></i>
                        </span>
                        <span className="slider-btn slider-next slick-arrow crosssell_next">
                            <i className="fi-rs-angle-right"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrossSellSlider;
