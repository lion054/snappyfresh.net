import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import apiClient from "../../config/api";
import SingleProduct from "./../ecommerce/SingleProduct";

const NewArrival = () => {
    const [newArrival, setNewArrival] = useState<any[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.getProducts(30);
            const allProducts = response.message || response.data || [];

            // Get random products for new arrival section
            const randomProducts = [...allProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 10);

            setNewArrival(randomProducts);
        } catch (err) {
            console.error('Error loading new arrival products:', err);
            setNewArrival([]);
        }
    };

    return (
        <>
            <Swiper
                modules={[Navigation]}
                spaceBetween={15}
                
                navigation={{
                    prevEl: ".custom_prev_n",
                    nextEl: ".custom_next_n"
                }}
                className="carausel-6-columns carausel-arrow-center"
                breakpoints={{
                    480: {
                        slidesPerView: 1
                    },
                    640: {
                        slidesPerView: 2
                    },
                    768: {
                        slidesPerView: 2
                    },
                    1024: {
                        slidesPerView: 4
                    }
                }}
            >
                {newArrival.map((product, i) => (
                    <SwiperSlide key={i}>
                        <SingleProduct product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="slider-arrow slider-arrow-2 carausel-6-columns-arrow" id="carausel-6-columns-2-arrows">
                <span className="slider-btn slider-prev slick-arrow custom_prev_n">
                    <i className="fi-rs-angle-left"></i>
                </span>
                <span className="slider-btn slider-next slick-arrow custom_next_n">
                    <i className="fi-rs-angle-right"></i>
                </span>
            </div>
        </>
    );
};

export default NewArrival;
