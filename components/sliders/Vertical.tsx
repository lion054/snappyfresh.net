import Link from 'next/link';
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const VerticalSlider = () => {
    return (
        <>
            <Swiper
                modules={[Pagination]}
                slidesPerView={1}
                spaceBetween={30}
                direction={"vertical"}
                pagination={{
                    clickable: true
                }}
                className="custom-class"
            >
                <ul>
                    <SwiperSlide>
                        <li>
                            Get great devices up to 50% off
                            <Link href="/store">View details</Link>
                        </li>
                    </SwiperSlide>
                    <SwiperSlide>
                        <li>Supper Value Deals - Save more with coupons</li>
                    </SwiperSlide>
                    <SwiperSlide>
                        <li>
                            Trendy 25silver jewelry, save up 35% off today
                            <Link href="/store">Shop now</Link>
                        </li>
                    </SwiperSlide>
                </ul>
            </Swiper>
        </>
    );
};

export default VerticalSlider;
