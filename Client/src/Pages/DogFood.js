import React, { useContext } from 'react';
import ProductList from '../Components/ProductList';
import { PetContext } from '../Context/Context';

export default function DogFood() {
  const { products } = useContext(PetContext);

  // Filter only Dog category products
  const dogFood = products?.filter(
    (product) => product.category === 'Dog'
  );

  return (
    <section
      className="products d-flex flex-column align-items-center mb-5"
      style={{ paddingTop: '100px' }}
    >
      <h1 className="mt-5 text-black fw-bolder">
        <span style={{ color: '#ff6b00' }}>Dog</span> Food
      </h1>

      {dogFood?.length > 0 ? (
        <ProductList products={dogFood} />
      ) : (
        <h5 className="mt-4 text-muted">No Dog Products Available</h5>
      )}
    </section>
  );
}
