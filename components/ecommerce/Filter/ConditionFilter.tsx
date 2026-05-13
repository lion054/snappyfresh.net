import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";
import CheckBox from "./Checkbox";

const ContitionFilter = () => {
    const { updateFilters } = useProductFilters();

    const [sizes, setSizeCheckbox] = useState([
        { name: "condition", value: "new", checked: false },
        { name: "condition", value: "refurbished", checked: false },
        { name: "condition", value: "used", checked: false },
    ]);

    const Router = useRouter();
    const searchTerm = Router.query["search"];

    const [selectedSizes, setSizes] = useState<string[]>([]);

    useEffect(() => {
        try {
            const filters = {
                condition: selectedSizes,
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating condition filter:", error);
        }
    }, [sizes, searchTerm]);

    const handleCheckBox = (
        event: any,
        filters: any,
        updatefilters: any,
        selectFilter: any,
        text: any
    ) => {
        const value = event.target.value;
        const updateSizes = filters;

        updateSizes.forEach((item: any) => {
            if (item.value === value) {
                if (item.checked) {
                    item.checked = false;
                    const newsize = text.filter((item: any) => item !== value);
                    selectFilter([...newsize]);
                } else {
                    item.checked = true;
                    const newsize = text.includes(value)
                        ? text
                        : [...text, value];
                    selectFilter([...newsize]);
                }
            }
        });

        updatefilters([...updateSizes]);
    };

    return (
        <>
            <div className="custome-checkbox">
                <CheckBox
                    heading="Select Size"
                    filters={sizes}
                    handleCheckBox={(e) => {
                        handleCheckBox(
                            e,
                            sizes,
                            setSizeCheckbox,
                            setSizes,
                            selectedSizes
                        );
                    }}
                />
            </div>
        </>
    );
};

export default ContitionFilter;
