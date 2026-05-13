import { useCompare } from "../../hooks";
import CompareTable from "./CompareTable";

const CompareModal = () => {
    // Use Context API hook instead of Redux
    const { compareList, clearCompare, removeFromCompare } = useCompare();

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        {compareList.length > 0 ? (
                            <>
                                <CompareTable
                                    data={compareList}
                                    features={["name", "price", "size"]}
                                    deleteFromCompare={removeFromCompare}
                                />
                                <div className="text-right">
                                    <button
                                        className="btn btn-warning clear-btn"
                                        onClick={clearCompare}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </>
                        ) : (
                            <h4>No Products</h4>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompareModal;
