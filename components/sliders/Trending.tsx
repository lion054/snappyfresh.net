import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SingleProduct2 from "./../ecommerce/SingleProduct2";

const TrendingSlider = ({products}: {products: any[]}) => {
    return (
        <>
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
                    prevEl: ".custom_prev_t",
                    nextEl: ".custom_next_t",
                }}
                className="custom-class"
            >
                {products.map((product, i) => (
                    <SwiperSlide key={i}>
                        <SingleProduct2 product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
         

            <div
                className="slider-arrow slider-arrow-2 carausel-4-columns-arrow"
            >
                <span className="slider-btn slider-prev slick-arrow custom_prev_t">
                    <i className="fi-rs-arrow-small-left"></i>
                </span>
                <span className="slider-btn slider-next slick-arrow custom_next_t">
                    <i className="fi-rs-arrow-small-right"></i>
                </span>
            </div>
        </>
    );
};

export default TrendingSlider;
