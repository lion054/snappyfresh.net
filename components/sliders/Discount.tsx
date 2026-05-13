import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useProducts } from "../../hooks";
import SingleProduct from "./../ecommerce/SingleProduct";

const DiscountSlider = () => {
    const { products: allProducts } = useProducts();
    const [discount, setDiscount] = useState<any[]>([]);

    useEffect(() => {
        if (allProducts.length > 0 && discount.length === 0) {
            const randomProducts = [...allProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 8);
            setDiscount(randomProducts);
        }
    }, [allProducts]);

    return (
        <>
            <Swiper
                modules={[Navigation]}
                slidesPerView={1.5}
                spaceBetween={10}
                breakpoints={{
                    480: { slidesPerView: 2, spaceBetween: 12 },
                    768: { slidesPerView: 3, spaceBetween: 15 },
                    1024: { slidesPerView: 4, spaceBetween: 15 },
                }}
                navigation={{
                    prevEl: ".custom_prev_d",
                    nextEl: ".custom_next_d",
                }}
                className="custom-class"
            >
                {discount.map((product, i) => (
                    <SwiperSlide key={i}>
                        <SingleProduct product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="custom-nav">
                <button type="button" className="custom_prev_d">
                    Prev
                </button>
                <button type="button" className="custom_next_d">
                    Next
                </button>
            </div>
        </>
    );
};


export default DiscountSlider;
