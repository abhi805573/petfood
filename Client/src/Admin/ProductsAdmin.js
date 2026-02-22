import React, { useContext, useState, useEffect } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import { PetContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/Button';
import toast from 'react-hot-toast';

export default function ProductsAdmin() {
  const navigate = useNavigate();

  // 🔥 UPDATED: fetchProducts added
  const { products, handlePrice, fetchProducts } = useContext(PetContext);

  const [category, setCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState('All');

  // Filter products whenever products OR filter changes
  useEffect(() => {
    if (selectedOption === 'All') {
      setCategory(products);
    } else {
      setCategory(
        products.filter(
          (product) => product.category === selectedOption
        )
      );
    }
  }, [selectedOption, products]);

  // 🔥 UPDATED DELETE FUNCTION (Auto Refresh)
  const handleDelete = async (productID) => {
    const confirmation = window.confirm(
      'Are you sure you want to delete this product?\nThis action cannot be undone.'
    );

    if (confirmation) {
      try {
        const response = await axios.delete(
          `/api/admin/products/${productID}`
        );

        toast.success(response.data.message);

        // 🔥 Refresh products after delete
        await fetchProducts();

      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to delete product'
        );
      }
    }
  };

  return (
    <div>
      <div className="dashboard-table products-admin px-3 py-3">
        <table>
          <thead>
            <tr>
              <td>
                <select
                  style={{ border: 'none' }}
                  value={selectedOption}
                  onChange={(e) =>
                    setSelectedOption(e.target.value)
                  }
                >
                  <option value="All">All</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </td>
              <td>Image</td>
              <td>Name</td>
              <td>Description</td>
              <td>Price</td>
              <td>Edit</td>
              <td>Delete</td>
            </tr>
          </thead>

          {category.length > 0 ? (
            category.map((product) => (
              <tbody key={product._id}>
                <tr>
                  <th>{product.category}</th>
                  <th>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '120px' }}
                    />
                  </th>
                  <th>{product.title}</th>
                  <th>
                    {product.description.slice(0, 60)}...
                  </th>
                  <th>{handlePrice(product.price)}</th>

                  <th>
                    <Button
                      className="me-1"
                      color="success"
                      onClick={() =>
                        navigate(
                          `/dashboard/products/${product._id}`
                        )
                      }
                    >
                      <MDBIcon fas icon="edit" />
                    </Button>
                  </th>

                  <th>
                    <Button
                      className="me-1"
                      color="danger"
                      onClick={() =>
                        handleDelete(product._id)
                      }
                    >
                      <MDBIcon fas icon="trash" />
                    </Button>
                  </th>
                </tr>
              </tbody>
            ))
          ) : (
            <tbody>
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No Products Found
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
