import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";

const Tags = () => {
    const { updateFilters } = useProductFilters();

    const tags = [
        { value: "" },
        { value: "snack" },
        { value: "milk" },
        { value: "fruit" },
        { value: "broccoli" },
        { value: "salad" },
        { value: "appetizer" },
    ];

    const [selectedTags, setTags] = useState<string[]>([]);
    const [active, setActive] = useState<number>(0);

    useEffect(() => {
        try {
            const filters = {
                tags: selectedTags,
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating tags filter:", error);
        }
    }, [selectedTags]);

    const handleClick = (i: number, target: string) => {
        setTags(selectedTags.includes(target)
            ? selectedTags.filter(t => t !== target)
            : [...selectedTags, target]);
        setActive(active == i ? 0 : i);
    };
    return (
        <>
            <ul className="tags-list">
                {tags.map((tag, i) => (
                    <li  className="hover-up" onClick={() => handleClick(i, tag.value)} key={i}>
                        <a
                            className={
                                active == i
                                    ? "cat-item text-brand-2"
                                    : "cat-item text-brand"
                            }
                        ><i className="fi-rs-cross mr-10"></i>
                            {i == 0 ? "All" : `${tag.value}`}
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Tags;
