import { useEffect, useState } from 'react';;
import apiClient from "../../config/api";
import Deals1 from "../elements/Deals1";

function FeatchDeals() {
    const [deals, setDeals] = useState<any[]>([]);

    const dealsProduct = async () => {
        try {
            const response = await apiClient.getProducts(30);
            const allProducts = response.message || response.data || [];

            // Get random products for deals section
            const randomProducts = [...allProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);

            setDeals(randomProducts);
        } catch (err) {
            console.error('Error loading deals:', err);
            setDeals([]);
        }
    };

    useEffect(() => {
        dealsProduct();
    }, []);

    // console.log(deals);

    return (
        <>

            <div className="row">
            {deals.slice(0,4).map((product, i) => (
                <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
                    <Deals1 product={product}/>
                </div>
                ))}
            </div>
        </>
    );
}
export default FeatchDeals;
