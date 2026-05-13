import { useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

interface Category {
    title: string;
}

const CategoryFilter = () => {
    const [active, setActive] = useState<number>(0);
    const { updateCategory } = useProductFilters();

    const selectCategory = (i: number, category: Category) => {
        try {
            updateCategory(category.title);
            setActive(active == i ? 0 : i);
        } catch (error) {
            logger.error("Error selecting category:", error);
        }
    };

    const categories = [
        { title: "" },
        { title: "jeans" },
        { title: "shoe" },
        { title: "jacket" },
        { title: "trousers" },
        { title: "accessories" },
    ];

    return (
        <>
            <ul className="categor-list">
                {categories.map((item, i) => (
                    <li onClick={() => selectCategory(i, item)}>
                        <a
                            className={
                                active == i
                                    ? "cat-item text-danger"
                                    : "cat-item text-muted"
                            }
                        >
                            {i == 0 ? "All" : `${item.title}`}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default CategoryFilter;
