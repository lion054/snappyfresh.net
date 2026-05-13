import { FC } from 'react';
import Sixty60ProductCard from "./Sixty60ProductCard";

interface SingleProductProps {
    product: any;
    index?: number;
}

const SingleProduct: FC<SingleProductProps> = ({ product, index }) => {
    return <Sixty60ProductCard product={product} index={index} />;
};

export default SingleProduct;
