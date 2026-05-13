import { useRouter } from "next/router";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const CategoryProduct = () => {
    const router = useRouter();
    const { updateCategory } = useProductFilters();

    const selectCategory = (category: string) => {
        try {
            updateCategory(category);
            router.push({
                pathname: "/products",
                query: {
                    cat: category,
                },
            });
        } catch (error) {
            logger.error("Error selecting category:", error);
        }
    };
    return (
        <>
            <ul>
                <li onClick={() => selectCategory( "")}>
                    <a>All</a>
                </li>
                <li onClick={() => selectCategory( "jeans")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-1.svg"
                            alt="Product category"
                        />
                        Milks & Dairies
                    </a>
                    <span className="count">30</span>
                </li>
                <li onClick={() => selectCategory( "shoe")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-2.svg"
                            alt="Product category"
                        />
                        Clothing
                    </a>
                    <span className="count">35</span>
                </li>
                <li onClick={() => selectCategory( "jacket")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-3.svg"
                            alt="Product category"
                        />
                        Pet Foods{" "}
                    </a>
                    <span className="count">42</span>
                </li>
            </ul>
        </>
    );
};

export default CategoryProduct;
