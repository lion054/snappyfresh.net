import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useProductFilters } from "../../../hooks";
import { logger } from "../../../lib/logger";
import CheckBox from "./Checkbox";

const VendorFilter = () => {
    const { updateFilters } = useProductFilters();

    const [sizes, setSizeCheckbox] = useState(
        [
            { name: "vendor", value: "NestFood", checked: false },
            { name: "vendor", value: "stouffer", checked: false },
            { name: "vendor", value: "starKist", checked: false },
            { name: "vendor", value: "aldi", checked: false },
            { name: "vendor", value: "adidas", checked: false },
            { name: "vendor", value: "Costco", checked: false },
            { name: "vendor", value: "Harris", checked: false },
            { name: "vendor", value: "iSnack", checked: false },
            { name: "vendor", value: "Burbe", checked: false }
        ]
    );

    const Router = useRouter();
    const searchTerm = Router.query["search"];

    const [selectedVendor, setVendor] = useState<string[]>([]);

    useEffect(() => {
        try {
            const filters = {
                vendor: selectedVendor
            };
            updateFilters(filters);
        } catch (error) {
            logger.error("Error updating vendor filter:", error);
        }
    }, [sizes, searchTerm]);

    const handleCheckBox = (event: any, filters: any, updatefilters: any, selectFilter: any, text: any) => {
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
                    const newsize = text.includes(value) ? text : [...text, value];
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
                        handleCheckBox(e, sizes, setSizeCheckbox, setVendor, selectedVendor);
                    }}
                />
            </div>
        </>
    );
};

export default VendorFilter;
