import { useState, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { Navigation, Thumbs, Zoom } from "swiper/modules";
import "swiper/css/thumbs";
import "swiper/css/zoom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Modal } from "react-responsive-modal";
import ProductImage from "../common/ProductImage";

interface ThumbSliderProps {
    product?: any;
    /** Increment to trigger lightbox open from parent */
    lightboxTrigger?: number;
}

const ThumbSlider = ({ product, lightboxTrigger }: ThumbSliderProps) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [zoomOrigin, setZoomOrigin] = useState("center center");
    const [isZoomed, setIsZoomed] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);

    const productTitle = product?.title || product?.ItemName || product?.itemName || 'Product';

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    }, []);

    const handleMainImageMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomOrigin(`${x}% ${y}%`);
    }, []);

    const handleMainImageMouseEnter = useCallback(() => {
        setIsZoomed(true);
    }, []);

    const handleMainImageMouseLeave = useCallback(() => {
        setIsZoomed(false);
        setZoomOrigin("center center");
    }, []);

    // Open lightbox when parent triggers it (e.g., zoom icon click)
    useEffect(() => {
        if (lightboxTrigger && lightboxTrigger > 0) {
            setLightboxOpen(true);
        }
    }, [lightboxTrigger]);

    return (
        <div>
            {/* Main image slider with hover zoom */}
            <Swiper
                modules={[Navigation, Thumbs, Zoom]}
                style={{
                    "--swiper-navigation-color": "#fff",
                    "--swiper-pagination-color": "#fff",
                } as any}
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                zoom={true}
                className="mySwiper2"
            >
                {product.gallery.map((item: any, index: number) => (
                    <SwiperSlide key={index}>
                        <div
                            ref={index === 0 ? mainImageRef : undefined}
                            className="sf-gallery-main-img"
                            onMouseMove={handleMainImageMouseMove}
                            onMouseEnter={handleMainImageMouseEnter}
                            onMouseLeave={handleMainImageMouseLeave}
                            onClick={() => openLightbox(index)}
                            style={{
                                cursor: 'zoom-in',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <ProductImage
                                src={item.thumb}
                                alt={`${productTitle} - image ${index + 1}`}
                                eager={index === 0}
                                context="detail"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    transition: 'transform 0.3s ease',
                                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                    transformOrigin: zoomOrigin,
                                }}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Thumbnail slider */}
            <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={8}
                slidesPerView={3}
                breakpoints={{
                    480: { slidesPerView: 4, spaceBetween: 10 },
                }}
                freeMode={true}
                watchSlidesProgress={true}
                className="mySwiper"
                role="group"
                aria-roledescription="carousel"
                aria-label={`${productTitle} image thumbnails`}
            >
                {product.gallery.map((item: any, index: number) => (
                    <SwiperSlide key={index}>
                        <ProductImage
                            src={item.thumb}
                            alt={`${productTitle} - thumbnail ${index + 1}`}
                            context="thumb"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Fullscreen lightbox modal */}
            <Modal
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                center
                classNames={{
                    overlay: 'sf-lightbox-overlay',
                    modal: 'sf-lightbox-modal',
                }}
            >
                <Swiper
                    modules={[Navigation, Zoom]}
                    navigation={true}
                    zoom={{ maxRatio: 3 }}
                    initialSlide={lightboxIndex}
                    spaceBetween={0}
                    slidesPerView={1}
                    style={{ width: '100%', height: '100%' }}
                >
                    {product.gallery.map((item: any, index: number) => (
                        <SwiperSlide key={index}>
                            <div className="swiper-zoom-container">
                                <ProductImage
                                    src={item.thumb}
                                    alt={`${productTitle} - image ${index + 1}`}
                                    context="zoom"
                                    eager
                                    style={{
                                        width: '100%',
                                        height: '85vh',
                                        objectFit: 'contain',
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Modal>
        </div>
    );
};

export default ThumbSlider;
