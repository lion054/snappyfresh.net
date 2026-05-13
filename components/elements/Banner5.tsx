import { useState, useEffect } from 'react';;
import Link from 'next/link';
import { useProducts } from "../../hooks";
import { getProductImageUrl } from "../../lib/imageProxy";

const Banner5 = () => {
    const { products: allProducts } = useProducts();
    const [centerProduct, setCenterProduct] = useState<any>(null);

    useEffect(() => {
        if (allProducts.length > 0 && !centerProduct) {
            selectRandomProduct(allProducts);
        }
    }, [allProducts]);

    useEffect(() => {
        if (allProducts.length === 0) return;

        const interval = setInterval(() => {
            selectRandomProduct(allProducts);
        }, 5000);

        return () => clearInterval(interval);
    }, [allProducts]);

    const selectRandomProduct = (products: any[]) => {
        if (products.length === 0) return;

        const productsWithImages = products.filter(p => !!getProductImageUrl(p, ''));
        const sourceProducts = productsWithImages.length > 0 ? productsWithImages : products;
        const randomIndex = Math.floor(Math.random() * sourceProducts.length);
        const product = sourceProducts[randomIndex];

        const productImage = getProductImageUrl(product, '/assets/imgs/banner/dairy.jpg');

        setCenterProduct({
            itemCode: product.itemCode,
            name: product.itemName || 'Product',
            image: productImage,
            link: `/product/${product.itemCode}`
        });
    };

    return (
        <>
            <style jsx>{`
                .promo-card {
                    position: relative;
                    border-radius: 15px;
                    overflow: hidden;
                    height: 380px;
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    align-items: flex-end;
                    padding: 35px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    transition: all 0.3s ease;
                }
                .promo-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                }
                .promo-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.15), transparent 50%);
                    z-index: 1;
                }
                .promo-card.peach::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to right, rgba(255, 245, 230, 0.95) 0%, rgba(255, 245, 230, 0.6) 35%, transparent 65%);
                    z-index: 0;
                }
                .promo-card.pink::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to top, rgba(252, 231, 243, 0.9) 0%, rgba(252, 231, 243, 0.6) 40%, transparent 70%);
                    z-index: 0;
                }
                .promo-card.blue::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to left, rgba(227, 242, 253, 0.9) 0%, rgba(227, 242, 253, 0.5) 30%, transparent 60%);
                    z-index: 0;
                }
                .promo-content {
                    position: relative;
                    z-index: 2;
                }
                .promo-content h4 {
                    color: #2d3748;
                    font-size: 22px;
                    font-weight: 700;
                    line-height: 1.3;
                    margin-bottom: 14px;
                    text-shadow: none;
                }
                .featured-badge {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #ff6b9d;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    z-index: 3;
                    box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
                }
                @media (max-width: 768px) {
                    .promo-card {
                        height: 200px;
                        padding: 20px;
                        border-radius: 10px;
                    }
                    .promo-content h4 {
                        font-size: 15px;
                        line-height: 1.3;
                        margin-bottom: 8px;
                    }
                    .featured-badge {
                        top: 10px;
                        left: 10px;
                        padding: 4px 10px;
                        font-size: 10px;
                    }
                }
                @media (max-width: 480px) {
                    .promo-card {
                        height: 160px;
                        padding: 14px;
                    }
                    .promo-content h4 {
                        font-size: 13px;
                    }
                }
            `}</style>

            <div className="row">
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="promo-card peach wow animate__animated animate__fadeInUp" data-wow-delay="0"
                        style={{ backgroundImage: `url(/assets/imgs/banner/fruits-modern.jpg)`, backgroundColor: '#fff5e6' }}>
                        <div className="promo-content">
                            <h4>Everyday Fresh &<br />Clean with Our<br />Products</h4>
                            <Link href="/store" className="btn btn-xs">
                                Shop Now <i className="fi-rs-arrow-small-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="promo-card pink wow animate__animated animate__fadeInUp" data-wow-delay=".2s"
                        style={{
                            backgroundImage: `url(${centerProduct?.image || '/assets/imgs/banner/milk-modern.jpg'})`,
                            backgroundColor: '#fce7f3',
                            transition: 'all 0.5s ease'
                        }}>
                        <span className="featured-badge">
                            <i className="fi-rs-bookmark"></i> Save
                        </span>
                        <div className="promo-content">
                            <h4>Make your Breakfast<br />Healthy and Easy</h4>
                            <Link href={centerProduct?.link || "/store"} className="btn btn-xs">
                                Shop Now <i className="fi-rs-arrow-small-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 d-md-none d-lg-block mb-4">
                    <div className="promo-card blue wow animate__animated animate__fadeInUp" data-wow-delay=".4s"
                        style={{ backgroundImage: `url(/assets/imgs/banner/groceries-modern.jpg)`, backgroundColor: '#e3f2fd' }}>
                        <div className="promo-content">
                            <h4>The best Organic<br />Products Online</h4>
                            <Link href="/store" className="btn btn-xs">
                                Shop Now <i className="fi-rs-arrow-small-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Banner5;
