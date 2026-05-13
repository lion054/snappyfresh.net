import { useEffect, useState } from 'react';;
import Link from 'next/link';
import { useProducts } from "../../hooks";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

const BestSellerSlider = () => {
    const { products: allProducts, isReady } = useProducts();
    const [bestSeller, setBestSeller] = useState<any[]>([]);

    useEffect(() => {
        if (allProducts.length > 0 && bestSeller.length === 0) {
            const randomProducts = [...allProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            setBestSeller(randomProducts);
        }
    }, [allProducts]);

    if (!isReady || bestSeller.length === 0) {
        return <div className="text-center py-3"><small>Loading...</small></div>;
    }

    return (
        <>
            {bestSeller.map((product, i) => {
                const productSlug = product.slug || product.itemCode || product.id;
                const productTitle = product.title || product.itemName || product.name;
                const productPrice = product.price || 0;
                const productImage = getProductImageUrl(product, PRODUCT_FALLBACK_IMAGE);

                return (
                    <article className="row align-items-center hover-up" key={i}>
                        <figure className="col-md-4 mb-0">
                            <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                                <img
                                    src={productImage}
                                    alt={productTitle}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                                    }}
                                />
                            </Link>
                        </figure>
                        <div className="col-md-8 mb-0">
                            <h6>
                                <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                                    {productTitle}
                                </Link>
                            </h6>
                            <div className="product-rate-cover">
                                <div className="product-rate d-inline-block">
                                    <div className="product-rating" style={{ width: "90%" }}></div>
                                </div>
                                <span className="font-small ml-5 text-muted"> ({product.ratingScore || '4.0'})</span>
                            </div>
                            <div className="product-price">
                                <span>${productPrice.toFixed(2)} </span>
                                {product.oldPrice && <span className="old-price">$ {product.oldPrice.toFixed(2)}</span>}
                            </div>
                        </div>
                    </article>
                );
            })}
        </>
    );
};

export default BestSellerSlider;
