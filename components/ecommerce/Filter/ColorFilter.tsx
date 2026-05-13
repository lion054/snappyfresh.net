import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const ColorFilter = () => {
    const { updateFilters } = useProductFilters();

    const colors = [
        { value: "" },
        { value: "red" },
        { value: "yellow" },
        { value: "white" },
        { value: "orange" },
        { value: "cyan" },
        { value: "green" },
        { value: "purple" },
    ];

    const [selectedColor, setColor] = useState<string>("");
    const [active, setActive] = useState<number>(0);

    useEffect(() => {
        try {
            const filters = {
                color: selectedColor,
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating color filter:", error);
        }
    }, [selectedColor, updateFilters]);

    const handleClick = (i: number, target: string) => {
        setColor(target);
        setActive(active == i ? 0 : i);
    };

    return (
        <>
            <ul className="list-filter color-filter">
                {colors.map((tag, i) => (
                    <li
                        className={active == i ? "active" : ""}
                        onClick={() => handleClick(i, tag.value)}
                    >
                        <a>
                            {i == 0 ? (
                                "All"
                            ) : (
                                <span
                                    className={`product-color-${tag.value}`}
                                ></span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default ColorFilter;
