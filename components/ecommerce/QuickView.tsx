
import { Modal } from 'react-responsive-modal';
import { useQuickView } from '../../hooks';
import ProductDetails from "./ProductDetails";

const QuickView = () => {
    // Use Context API hook instead of Redux
    const { quickViewProduct, isQuickViewOpen, closeQuickView } = useQuickView();

    return (
        <>
            <Modal open={isQuickViewOpen} onClose={closeQuickView}>
                {quickViewProduct && (
                    <div className="quick-view">
                        <ProductDetails product={quickViewProduct} quickView={true} />
                    </div>
                )}
            </Modal>
        </>
    );
};

export default QuickView;
