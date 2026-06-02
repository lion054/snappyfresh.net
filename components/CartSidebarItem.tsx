import { memo, FC } from 'react';
import { PRODUCT_FALLBACK_IMAGE } from '../lib/imageProxy';

interface CartSidebarItemProps {
  item: any;
  index: number;
  onIncrease: (index: number) => void;
  onDecrease: (index: number) => void;
  onRemove: (index: number) => void;
}

const CartSidebarItem: FC<CartSidebarItemProps> = ({ item, index, onIncrease, onDecrease, onRemove }) => {
  const itemPrice = item.uom?.price || item.price || 0;
  const itemName = item.itemName || item.name || "Product";
  const itemImage = item.product?.images?.[0]?.img || item.image || PRODUCT_FALLBACK_IMAGE;

  return (
    <li>
      <div className="d-flex">
        <div className="flex-grow-1">
          <img
            src={itemImage}
            style={{
              width: "75px",
              height: "75px",
            }}
            className="align-self-center mr-2"
            alt="Product image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
            }}
          />
          <div>
            <h6 className="mb-0">
              {itemName}
            </h6>
            <p className="mb-0">
              <span>${itemPrice.toFixed(2)} </span> x
              <span>{item.quantity}</span>
            </p>
            <div className="quantity-switch">
              <span
                onClick={() => onDecrease(index)}
              >
                <button>-</button>
              </span>
              <span
                onClick={() => onIncrease(index)}
              >
                <button>+</button>
              </span>
            </div>
          </div>
        </div>
        <div className="single-total">
          ${(item.quantity * itemPrice).toFixed(2)}
          <span
            className="ml-2"
            onClick={() => onRemove(index)}
          >
            <button>Delete</button>
          </span>
        </div>
      </div>
    </li>
  );
};

export default memo(CartSidebarItem);
