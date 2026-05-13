import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const Rating = () => {
    const { updateFilters } = useProductFilters();

    const ratings = [
        { value: "" },
        { value: "5" },
        { value: "4" },
        { value: "3" },
        { value: "2" },
        { value: "1" },
    ];

    const [productRating, setProductRating] = useState<string>("");
    const [active, setActive] = useState<number>(0);

    useEffect(() => {
        try {
            if (productRating) {
                const filters = {
                    rating: parseInt(productRating),
                };
                updateFilters(filters);
            }
        } catch (error) {
            logger.error("Error updating rating filter:", error);
        }
    }, [productRating, updateFilters]);

    const handleClick = (i: number, target: string) => {
        setProductRating(target);
        setActive(active == i ? 0 : i);
    };

    return (
        <>
            {ratings.map((rate, i) => (
                <>
                    <div
                        className={active == i ? "active" : ""}
                        onClick={() => handleClick(i, rate.value)}
                    >
                        <a>
                            {i == 0 ? (
                                "All"
                            ) : (
                                <>
                                    <div className="product-rate-cover">
                                        <div className="product-rate d-inline-block">
                                            {rate.value === "1" && (
                                                <div
                                                    className="product-rating"
                                                    style={{ width: "20%" }}
                                                ></div>
                                            )}
                                            {rate.value === "2" && (
                                                <div
                                                    className="product-rating"
                                                    style={{ width: "40%" }}
                                                ></div>
                                            )}
                                            {rate.value === "3" && (
                                                <div
                                                    className="product-rating"
                                                    style={{ width: "60%" }}
                                                ></div>
                                            )}
                                            {rate.value === "4" && (
                                                <div
                                                    className="product-rating"
                                                    style={{ width: "80%" }}
                                                ></div>
                                            )}
                                            {rate.value === "5" && (
                                                <div
                                                    className="product-rating"
                                                    style={{ width: "100%" }}
                                                ></div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </a>
                    </div>
                </>
            ))}
        </>
    );
};

export default Rating;
