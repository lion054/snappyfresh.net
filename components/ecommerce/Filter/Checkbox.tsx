import { ChangeEvent } from "react";

interface CheckBoxItem {
    name: string;
    value: string;
    checked: boolean;
}

interface CheckBoxProps {
    filters: CheckBoxItem[];
    handleCheckBox: (e: ChangeEvent<HTMLInputElement>) => void;
    heading?: string;
}

const CheckBox = ({ filters, handleCheckBox }: CheckBoxProps) => {
    return (
        <>
            {filters.map((item, id) => (
                <div key={id}>
                    <input
                        type="checkbox"
                        className="form-check-input"
                        name={item.name}
                        value={item.value}
                        checked={item.checked}
                        onChange={(e) => handleCheckBox(e)}
                        id={item.value}
                        
                    />
                    <label className="form-check-label" htmlFor={item.value} style={{textTransform:"capitalize"}}> {item.value}</label>
                    <br/>
                </div>
            ))}
        </>
    );
};

export default CheckBox;
