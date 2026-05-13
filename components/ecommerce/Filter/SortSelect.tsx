import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

import { ChangeEvent } from "react";

const SortSelect = () => {
    const { updateFilters } = useProductFilters();
    const Router = useRouter();
    const searchTerm = Router.query["search"];

    const [featured, setFeatured] = useState<string>("");

    useEffect(() => {
        try {
            if (featured) {
                const filters = {
                    sortBy: featured as any,
                };
                updateFilters(filters);
            }
        } catch (error) {
            logger.error("Error updating sort filter:", error);
        }
    }, [searchTerm, featured, updateFilters]);

    const seleceOption = (e: ChangeEvent<HTMLSelectElement>) => {
        setFeatured(e.target.value);
    };

    return (
        <>
            <div className="sort-by-product-wrap">
                <div className="sort-by">
                    <span>
                        <i className="fi-rs-apps-sort"></i>
                        Sort by:
                    </span>
                </div>
                <div className="sort-by-dropdown-wrap custom-select">
                    <select onChange={(e) => seleceOption(e)}>
                        <option value="">Defaults</option>
                        <option value="featured">Featured</option>
                        <option value="trending">Trending</option>
                        <option value="lowToHigh">Low To High</option>
                        <option value="highToLow">High To Low</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default SortSelect;
