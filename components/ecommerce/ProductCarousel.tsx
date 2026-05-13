import { useRef } from 'react';;
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Sixty60ProductCard from "./Sixty60ProductCard";
import { Product } from "../../types/models/product";

interface ProductCarouselProps {
    products?: Product[];
}

const ProductCarousel = ({ products = [] }: ProductCarouselProps) => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    if (!products || products.length === 0) return null;

    return (
        <div className="s60-carousel-wrap">
            <button ref={prevRef} className="s60-carousel-arrow s60-carousel-arrow--prev" aria-label="Previous">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button ref={nextRef} className="s60-carousel-arrow s60-carousel-arrow--next" aria-label="Next">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={12}
                slidesPerView={6}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper) => {
                    if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
                        (swiper.params.navigation as any).prevEl = prevRef.current;
                        (swiper.params.navigation as any).nextEl = nextRef.current;
                    }
                }}
                pagination={{ clickable: true }}
                breakpoints={{
                    0: { slidesPerView: 2, spaceBetween: 8 },
                    480: { slidesPerView: 3, spaceBetween: 10 },
                    768: { slidesPerView: 4, spaceBetween: 12 },
                    1024: { slidesPerView: 5, spaceBetween: 12 },
                    1200: { slidesPerView: 6, spaceBetween: 12 },
                }}
            >
                {products.map((product, i) => (
                    <SwiperSlide key={product.ItemCode || product.itemCode || product.id || i}>
                        <Sixty60ProductCard product={product} index={i} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ProductCarousel;
