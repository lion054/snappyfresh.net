import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SingleProduct from "../ecommerce/SingleProduct";
import { useUpsells } from "../../hooks/useUpsells";

const UpsellSlider = ({ currentProduct }: { currentProduct?: any }) => {
    const { data: upsells, isLoading } = useUpsells(currentProduct);

    if (isLoading || !upsells || upsells.length === 0) return null;

    return (
        <div className="row mt-60">
            <div className="col-12">
                <h3 className="section-title style-1 mb-30">Frequently Bought Together</h3>
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
                            prevEl: ".upsell_prev",
                            nextEl: ".upsell_next",
                        }}
                        className="custom-class"
                    >
                        {upsells.map((product, i) => (
                            <SwiperSlide key={product.ItemCode || product.itemCode || i}>
                                <SingleProduct product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="slider-arrow slider-arrow-2 carausel-6-columns-arrow">
                        <span className="slider-btn slider-prev slick-arrow upsell_prev">
                            <i className="fi-rs-angle-left"></i>
                        </span>
                        <span className="slider-btn slider-next slick-arrow upsell_next">
                            <i className="fi-rs-angle-right"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpsellSlider;
