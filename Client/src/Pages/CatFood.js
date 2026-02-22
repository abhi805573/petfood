import React, { useContext } from 'react';
import ProductList from '../Components/ProductList';
import { PetContext } from '../Context/Context';

export default function CatFood() {
  const { products } = useContext(PetContext);

  // Filter only Cat category products
  const catFood = products?.filter(
    (product) => product.category === 'Cat'
  );

  return (
    <section
      className="products d-flex flex-column align-items-center mb-5"
      style={{ paddingTop: '100px' }}
    >
      <h1 className="mt-5 text-black fw-bolder">
        <span style={{ color: '#ff6b00' }}>Cat</span> Food
      </h1>

      {catFood?.length > 0 ? (
        <ProductList products={catFood} />
      ) : (
        <h5 className="mt-4 text-muted">No Cat Products Available</h5>
      )}
    </section>
  );
}
