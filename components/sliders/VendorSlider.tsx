import Link from 'next/link';
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import vendorData from "../../util/storeData";

const VendorSlider = () => {
    // For now, we only have Yomilk. But this structure allows easy expansion.
    // When more vendors are added to storeData.js, they'll automatically appear here.
    let vendors = vendorData.map(vendor => ({
        id: vendor.id,
        name: vendor.title,
        logo: vendor.img,
        description: vendor.desc,
        // You can add these fields to storeData.js later:
        itemCount: 93, // Total products from this vendor
        slug: vendor.title.toLowerCase().replace(/\s+/g, '-')
    }));

    // If there's only one vendor, repeat it to fill the slider nicely
    if (vendors.length === 1) {
        const singleVendor = vendors[0]!;
        vendors = Array(6).fill(null).map((_, index) => ({
            ...singleVendor,
            id: `${singleVendor.id}-${index}` // Unique ID for React keys
        })) as any;
    }

    return (
        <>
            <Swiper
                modules={[Autoplay]}
                slidesPerView={2}
                spaceBetween={12}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
                breakpoints={{
                    480: { slidesPerView: 2, spaceBetween: 15 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    1024: { slidesPerView: 4, spaceBetween: 20 },
                    1200: { slidesPerView: 5, spaceBetween: 24 },
                }}
                loop={true}
                className="vendor-slider"
            >
                {vendors.map((vendor) => (
                    <SwiperSlide key={vendor.id}>
                        <Link
                            href={`/shop?vendor=${vendor.slug}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="vendor-card">
                                <div className="vendor-logo-wrapper">
                                    <img
                                        src={`/assets/imgs/vendor/${vendor.logo}`}
                                        alt={vendor.name}
                                        className="vendor-logo"
                                    />
                                </div>
                                <div className="vendor-info">
                                    <h6 className="vendor-name">{vendor.name}</h6>
                                    <span className="vendor-count">{vendor.itemCount} items</span>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx>{`
                .vendor-card {
                    background: white;
                    border: 2px solid #ececec;
                    border-radius: 16px;
                    padding: 24px 20px;
                    text-align: center;
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                }

                .vendor-card:hover {
                    border-color: #1a5c38;
                    box-shadow: 0 8px 24px rgba(26, 92, 56, 0.15);
                    transform: translateY(-6px);
                }

                .vendor-logo-wrapper {
                    width: 120px;
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 16px;
                    transition: all 0.3s ease;
                }

                .vendor-card:hover .vendor-logo-wrapper {
                    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                    transform: scale(1.05);
                }

                .vendor-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08));
                }

                .vendor-info {
                    width: 100%;
                }

                .vendor-name {
                    font-size: 16px;
                    font-weight: 700;
                    color: #253d4e;
                    margin-bottom: 6px;
                    line-height: 1.3;
                    transition: color 0.3s ease;
                }

                .vendor-card:hover .vendor-name {
                    color: #1a5c38;
                }

                .vendor-count {
                    font-size: 13px;
                    color: #7e7e7e;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .vendor-card {
                        padding: 20px 16px;
                        min-height: 180px;
                    }

                    .vendor-logo-wrapper {
                        width: 100px;
                        height: 100px;
                        margin-bottom: 12px;
                    }

                    .vendor-name {
                        font-size: 14px;
                    }

                    .vendor-count {
                        font-size: 12px;
                    }
                }
            `}</style>
        </>
    );
};

export default VendorSlider;
