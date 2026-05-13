import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import SingleProduct from "../ecommerce/SingleProduct";

interface ProductCarouselProps {
  title: string;
  products: any[];
  navId?: string;
}

const ProductCarousel = ({ title, products, navId = "products" }: ProductCarouselProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="row mt-60">
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
              prevEl: `.${navId}_prev`,
              nextEl: `.${navId}_next`,
            }}
            className="custom-class"
          >
            {products.map((product, i) => (
              <SwiperSlide key={product.ItemCode || product.itemCode || i}>
                <SingleProduct product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="slider-arrow slider-arrow-2 carausel-6-columns-arrow">
            <span className={`slider-btn slider-prev slick-arrow ${navId}_prev`}>
              <i className="fi-rs-angle-left"></i>
            </span>
            <span className={`slider-btn slider-next slick-arrow ${navId}_next`}>
              <i className="fi-rs-angle-right"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
