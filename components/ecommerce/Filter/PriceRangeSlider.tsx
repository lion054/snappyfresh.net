import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


const PriceRangeSlider = () => {
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
            logger.error("Error updating price range slider:", error);
        }
    }, [price, searchTerm]);

    return (
        <>
            {/* <InputRange
                formatLabel={(value) => `$${value}`}
                maxValue={500}
                minValue={0}
                value={price.value}
                onChange={(value) => setPrice({ value })}
            /> */}

            <Slider
                range
                allowCross={false}
                defaultValue={[0, 100]}
                min={0}
                max={500}
                // onChange={(value) => console.log(value[0], value[1])}
                onChange={(value: any) => setPrice({ value: { min: value[0], max: value[1] } })}
            />

            <div className="d-flex justify-content-between">
                <span>
                    {price.value.min}
                </span>
                <span>
                    {price.value.max}
                </span>
            </div>




            {/* <ul className="price-list">
                <li
                    className={active == 1 ? "active" : ""}
                    onClick={() => { handleActive(1); setPrice({ value: { min: 0, max: 500 } }) }}
                >
                    All

                </li>

                <li
                    className={active == 2 ? "active" : ""}
                    onClick={() => { handleActive(2); setPrice({ value: { min: 0, max: 20 } }) }}
                >
                    $0k - $20k

                </li>
                <li
                    className={active == 3 ? "active" : ""}
                    onClick={() => { handleActive(3); setPrice({ value: { min: 20, max: 40 } }) }}
                >
                    $20k - $40k

                </li>
                <li
                    className={active == 4 ? "active" : ""}
                    onClick={() => { handleActive(4); setPrice({ value: { min: 40, max: 60 } }) }}
                >
                    $40k - $60k

                </li>
                <li
                    className={active == 5 ? "active" : ""}
                    onClick={() => { handleActive(5); setPrice({ value: { min: 60, max: 80 } }) }}
                >
                    $60k - $80k

                </li>
                <li
                    className={active == 6 ? "active" : ""}
                    onClick={() => { handleActive(6); setPrice({ value: { min: 80, max: 100 } }) }}
                >
                    $80k - $100k

                </li>
                <li
                    className={active == 7 ? "active" : ""}
                    onClick={() => { handleActive(7); setPrice({ value: { min: 100, max: 200 } }) }}
                >
                    $100k - $200k

                </li>
            </ul> */}


        </>
    );
};

export default PriceRangeSlider;
