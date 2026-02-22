import React, { useEffect, useState } from 'react';
import { axios } from '../Utils/Axios';
import { MDBIcon } from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';

export default function HomeDashboard() {

  const [dashboardData, setDashboardData] = useState(null);

  const handlePrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN')}`;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard');

        if (response.status === 200) {
          setDashboardData(response.data.data);
        }

      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, []);

  const recentProducts = dashboardData?.recentProducts || [];
  const recentUsers = dashboardData?.recentUsers || [];

  return (
    <div>

      {/* 🔥 STATS SECTION */}
      <div className="d-flex justify-content-center align-items-center gap-5 mb-5">

        <div className="content-box">
          <h6>Total Orders</h6>
          <h2>{dashboardData?.totalOrders || 0}</h2>
        </div>

        <div className="content-box">
          <h6>Total Revenue</h6>
          <h2>{handlePrice(dashboardData?.totalRevenue)}</h2>
        </div>

        <div className="content-box">
          <h6>Total Products Sold</h6>
          <h2>{dashboardData?.totalProductsSold || 0}</h2>
        </div>

      </div>

      {/* 🔥 RECENT PRODUCTS & USERS */}
      <div className="dashboard-recent d-flex justify-content-center">

        {/* New Products */}
        <div className="dashboard-table recent-admin ps-5">
          <h4>New Products</h4>
          <table>
            <thead>
              <tr>
                <td>Category</td>
                <td>Name</td>
                <td>Price</td>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="text-center">{product.category}</td>
                    <td>{product.title.slice(0, 24)}</td>
                    <td>{handlePrice(product.price)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">No Products</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Users */}
        <div className="dashboard-table recent-admin ps-5">
          <h4>Recent Users</h4>
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Email</td>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name.split(' ')[0]}</td>
                    <td>{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">No Users</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}