import React, { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthContext';

const AdminDashboard = () => {
  const { backendUser, currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!backendUser || backendUser.role !== 'ADMIN') {
      setError('Access denied: Only admins can view this page.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = await currentUser.getIdToken();

        const [usersResponse, ordersResponse] = await Promise.all([
          fetch('http://localhost:8080/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8080/api/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');

        const usersData = await usersResponse.json();
        const ordersData = await ordersResponse.json();

        setUsers(usersData);
        setOrders(ordersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, backendUser, currentUser]);

  if (authLoading || loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      <div className="accordion mt-4" id="adminAccordion">
        {/* Users Section */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="usersHeading">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#usersCollapse" aria-expanded="true" aria-controls="usersCollapse">
              All Users
            </button>
          </h2>
          <div id="usersCollapse" className="accordion-collapse collapse show" aria-labelledby="usersHeading" data-bs-parent="#adminAccordion">
            <div className="accordion-body">
              <table className="table table-bordered">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="4" className="text-center">No users found</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name || '-'}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="ordersHeading">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#ordersCollapse" aria-expanded="false" aria-controls="ordersCollapse">
              All Orders
            </button>
          </h2>
          <div id="ordersCollapse" className="accordion-collapse collapse" aria-labelledby="ordersHeading" data-bs-parent="#adminAccordion">
            <div className="accordion-body">
              <table className="table table-bordered">
                <thead>
                  <tr><th>ID</th><th>Status</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="3" className="text-center">No orders found</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.status}</td>
                        <td>R {order.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
