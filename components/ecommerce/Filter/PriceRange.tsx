import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const PriceRange = () => {
    const { updateFilters } = useProductFilters();

    const Router = useRouter();
    const searchTerm = Router.query["search"];

    const [price, setPrice] = useState({ value: { min: 0, max: 500 } });

    useEffect(() => {
        try {
            const filters = {
                minPrice: price.value.min,
                maxPrice: price.value.max,
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating price range filter:", error);
        }
    }, [price, searchTerm]);

    const data = [
        {
            min: 0,
            max: 500,
        },
        {
            min: 50,
            max: 100,
        },
        {
            min: 100,
            max: 150,
        },
        {
            min: 150,
            max: 200,
        },
        {
            min: 200,
            max: 250,
        },
        {
            min: 250,
            max: 300,
        },
        {
            min: 300,
            max: 350,
        },        
    ];

    return (
        <>
            {/* <InputRange
                formatLabel={(value) => `${value}`}
                maxValue={500}
                minValue={0}
                value={price.value}
                onChange={(value) => setPrice({ value })}

            /> */}
            <label className="fw-900 mt-15">Range</label>
            <div className="custome-checkbox">
                {data.map((item, i) => (
                    <div key={i}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={`price-${i}`} onChange={() => setPrice({ value: { min: item.min, max: item.max } })}
                        />
                        <label htmlFor={`price-${i}`} className="form-check-label">${item.min} - ${item.max}</label>

                        <br/>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PriceRange;
