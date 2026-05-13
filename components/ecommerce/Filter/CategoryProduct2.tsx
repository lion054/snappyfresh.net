import { useRouter } from "next/router";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const CategoryProduct2 = () => {
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
                <li onClick={() => selectCategory("jeans")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-1.svg"
                            alt="Product category"
                        />
                        Milks & Dairies
                    </a>

                </li>
                <li onClick={() => selectCategory("shoe")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-2.svg"
                            alt="Product category"
                        />
                        Clothing
                    </a>

                </li>
                <li onClick={() => selectCategory("jacket")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-3.svg"
                            alt="Product category"
                        />
                        Pet Foods{" "}
                    </a>

                </li>
                <li onClick={() => selectCategory("trousers")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-4.svg"
                            alt="Product category"
                        />
                        Baking material
                    </a>

                </li>
                <li onClick={() => selectCategory("accessories")}>
                    <a>
                        <img
                            src="/assets/imgs/theme/icons/category-5.svg"
                            alt="Product category"
                        />
                        Fresh Fruit
                    </a>
                </li>
            </ul>
        </>
    );
};

export default CategoryProduct2;
