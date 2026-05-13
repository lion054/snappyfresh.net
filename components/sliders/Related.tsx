import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useProducts } from "../../hooks";
import SingleProduct from "./../ecommerce/SingleProduct";

const RelatedSlider = ({ currentProduct }: { currentProduct?: any }) => {
    const { products: allProducts, isReady } = useProducts();
    const [related, setRelated] = useState<any[]>([]);

    useEffect(() => {
        if (!isReady || allProducts.length === 0) return;

        const groupCode = currentProduct?.ItemsGroupCode ?? currentProduct?.itemsGroupCode;
        const currentCode = currentProduct?.ItemCode || currentProduct?.itemCode;

        let candidates = allProducts;

        // Filter by same group if available
        if (groupCode !== undefined && groupCode !== null && groupCode !== '') {
            const grouped = allProducts.filter(p =>
                ((p as any).ItmsGrpCod || (p as any).itemsGroupCode) == groupCode
            );
            if (grouped.length > 0) {
                candidates = grouped;
            }
        }

        // Remove current product
        if (currentCode) {
            candidates = candidates.filter(p => {
                const code = p?.ItemCode || p?.itemCode;
                return code !== currentCode;
            });
        }

        // Get random products for related section
        const randomProducts = [...candidates]
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

        setRelated(randomProducts);
    }, [allProducts, currentProduct?.ItemCode, currentProduct?.itemCode, currentProduct?.ItemsGroupCode, currentProduct?.itemsGroupCode]);

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
                    prevEl: ".custom_prev_n",
                    nextEl: ".custom_next_n",
                }}
                className="custom-class"
            >
                {related.map((product, i) => (
                    <SwiperSlide key={i}>
                        <SingleProduct product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>

            <div
                className="slider-arrow slider-arrow-2 carausel-6-columns-arrow"
            >
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

export default RelatedSlider;
