import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const SizeFilter = () => {
    const { updateFilters } = useProductFilters();

    const sizes = [
        { value: "s" },
        { value: "m " },
        { value: "l" },
        { value: "xl" },
    ];

    const [selectedSizes, setSizes] = useState<string[]>([]);
    const [active, setActive] = useState<number>(0);

    useEffect(() => {
        try {
            const filters = {
                sizes: selectedSizes,
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating size filter:", error);
        }
    }, [selectedSizes, updateFilters]);

    const handleClick = (i: number, target: string) => {
        setSizes(selectedSizes.includes(target)
            ? selectedSizes.filter(s => s !== target)
            : [...selectedSizes, target]);
        setActive(active == i ? 0 : i);
    };

    return (
        <>
            <ul className="list-filter size-filter font-small">
                {sizes.map((tag, i) => (
                    <li
                        className={active == i ? "active" : ""}
                        onClick={() => handleClick(i, tag.value)}
                        key={i}
                    >
                        <a>
                            {i == 0 ? "All" : `${tag.value}`}
                        </a>
                    </li>
                ))}
            </ul>

        </>
    );
};

export default SizeFilter;
