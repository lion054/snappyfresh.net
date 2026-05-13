import { toast } from 'react-toastify';
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";

const Intro1 = () => {
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleWhatsAppJoin = (e: any) => {
        e.preventDefault();

        // Validate phone number
        if (!phoneNumber || phoneNumber.trim() === "") {
            toast.error("Please enter your WhatsApp number");
            return;
        }

        // Remove any non-digit characters and ensure it starts with country code
        let cleanNumber = phoneNumber.replace(/\D/g, "");

        // If number starts with 0, replace it with 263 (Zimbabwe country code)
        if (cleanNumber.startsWith("0")) {
            cleanNumber = "263" + cleanNumber.slice(1);
        }

        // If number doesn't have country code, add Zimbabwe's
        if (!cleanNumber.startsWith("263") && cleanNumber.length === 9) {
            cleanNumber = "263" + cleanNumber;
        }

        // Validate length (should be at least 11 digits with country code)
        if (cleanNumber.length < 11) {
            toast.error("Please enter a valid WhatsApp number");
            return;
        }

        // Send to WhatsApp with channel link
        const message = "Hi%20Snappy%20Fresh%2C%20I%20want%20to%20join%20your%20WhatsApp%20channel%20for%20daily%20deals%20and%20delivery%20updates";
        const whatsappLink = `https://wa.me/${cleanNumber}?text=${message}`;

        window.open(whatsappLink, "_blank");
        setPhoneNumber("");
        toast.success("Opening WhatsApp...");
    };

    return (
        <>
            <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={1}
                spaceBetween={0}

                pagination={true}
                navigation={{
                    prevEl: ".custom_prev_i1",
                    nextEl: ".custom_next_i1",
                }}
                className="hero-slider-1 style-4 dot-style-1 dot-style-1-position-1"
            >
                <SwiperSlide>
                    <div
                        className="single-hero-slider single-animation-wrap"
                        style={{
                            backgroundImage:
                                "url(assets/imgs/slider/slider-1.png)",
                        }}
                    >
                        <div className="slider-content">
                            <h1 className="display-2 mb-40">
                                Don't miss amazing
                                <br />
                                grocery deals
                            </h1>
                            <p className="mb-65">
                                Get flash sales & delivery updates on WhatsApp
                            </p>
                            <form className="form-subcriber d-flex" onSubmit={handleWhatsAppJoin}>
                                <input
                                    type="tel"
                                    placeholder="Your WhatsApp number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    pattern="[0-9\s\-\+\(\)]+"
                                />
                                <button className="btn" type="submit">
                                    Join Now
                                </button>
                            </form>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div
                        className="single-hero-slider single-animation-wrap"
                        style={{
                            backgroundImage:
                                "url(assets/imgs/slider/slider-2.png)",
                        }}
                    >
                        <div className="slider-content">
                            <h1 className="display-2 mb-40">
                                Fresh Vegetables
                                <br />
                                Big discount
                            </h1>
                            <p className="mb-65">
                                Save up to 50% off on your first order - Join WhatsApp
                            </p>
                            <form className="form-subcriber d-flex" onSubmit={handleWhatsAppJoin}>
                                <input
                                    type="tel"
                                    placeholder="Your WhatsApp number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    pattern="[0-9\s\-\+\(\)]+"
                                />
                                <button className="btn" type="submit">
                                    Join Now
                                </button>
                            </form>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>

            <div className="slider-arrow hero-slider-1-arrow">
                <span className="slider-btn slider-prev slick-arrow custom_prev_i1">
                    <i className="fi-rs-angle-left"></i>
                </span>
                <span className="slider-btn slider-next slick-arrow custom_next_i1">
                    <i className="fi-rs-angle-right"></i>
                </span>
            </div>
        </>
    );
};

export default Intro1;
