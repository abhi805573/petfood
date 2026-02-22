import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';

function Orders() {
  const { handlePrice } = useContext(PetContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/users/orders");
        setOrders(response.data?.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <section className="products text-center" style={{ paddingTop: '150px' }}>
        <h3>Loading Orders...</h3>
      </section>
    );
  }

  return (
    <section
      className="products d-flex flex-column align-items-center mb-5 text-black"
      style={{ paddingTop: '100px' }}
    >
      <h1 className="mt-5 mb-5 fw-bolder">
        <span style={{ color: "#f97316" }}>My</span> Orders
      </h1>

      <div className="dashboard-table pt-4 px-4 w-75">
        <table className="w-100">
          <tbody className="text-center">

            {orders.length === 0 && (
              <tr>
                <td colSpan="5">
                  <h3>No Orders Found</h3>
                </td>
              </tr>
            )}

            {orders.map((singleOrder) => (
              <React.Fragment key={singleOrder._id}>

                {singleOrder.products?.map((item, index) => (
                  <tr key={index}>

                    <td>
                      <img
                        src={item.product?.image}
                        alt={item.product?.title}
                        style={{ width: '80px', cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/products/${item.product?._id}`)
                        }
                      />
                    </td>

                    <td>{item.product?.title}</td>

                    <td>
                      Qty: {item.quantity}
                    </td>

                    <td>
                      {handlePrice(
                        (item.product?.price || 0) * item.quantity
                      )}
                    </td>

                    <td>
                      {new Date(singleOrder.createdAt).toLocaleDateString()}
                    </td>

                  </tr>
                ))}

                <tr>
                  <td colSpan="5">
                    <hr />
                  </td>
                </tr>

              </React.Fragment>
            ))}

          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Orders;