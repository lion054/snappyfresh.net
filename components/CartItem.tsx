import { memo, FC } from 'react';
import { getProductImageUrl } from '../lib/imageProxy';
import ProductImage from './common/ProductImage';

interface CartItemProps {
  item: any;
  index: number;
  onIncrement: (index: number) => void;
  onDecrement: (index: number) => void;
  onRemove: (index: number) => void;
}

const CartItem: FC<CartItemProps> = ({ item, index, onIncrement, onDecrement, onRemove }) => {
  const product = item.product || {};
  const itemPrice = item.uom?.price || 0;
  const oldPrice = (product as any).oldPrice || itemPrice;
  const itemSaving = oldPrice - itemPrice;
  const itemImage = getProductImageUrl(product);

  return (
    <div key={`${item.itemCode}-${index}`} className="cart-item">
      <ProductImage src={itemImage} alt={item.itemName} context="thumb" style={{ width: 80, height: 80, objectFit: 'contain' }} />
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.itemName}</h3>
        <div className="cart-item-price">${itemPrice.toFixed(2)} {item.uom?.uomName && `/ ${item.uom.uomName}`}</div>
        {itemSaving > 0 && (
          <div className="cart-item-save">Save ${(itemSaving * item.quantity).toFixed(2)}</div>
        )}
        <div className="cart-item-quantity">
          <button
            className="qty-btn"
            onClick={() => onDecrement(index)}
            aria-label={"Decrease quantity of " + item.itemName}
          >
            −
          </button>
          <span className="qty-value" aria-label={"Quantity: " + item.quantity}>{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => onIncrement(index)}
            aria-label={"Increase quantity of " + item.itemName}
          >
            +
          </button>
        </div>
        {product.UnitsOnStock != null && product.UnitsOnStock < 10 && product.UnitsOnStock > 0 && (
          <span className="stock-limit-hint">Only {product.UnitsOnStock} left</span>
        )}
      </div>
      <button
        className="cart-item-delete"
        onClick={() => {
          if (window.confirm(`Remove "${item.itemName}" from cart?`)) {
            onRemove(index);
          }
        }}
        aria-label={`Remove ${item.itemName} from cart`}
      >
        🗑
      </button>
    </div>
  );
};

export default memo(CartItem);
