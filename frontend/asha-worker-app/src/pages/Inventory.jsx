import { useState } from 'react';
import { FiPackage, FiAlertCircle } from 'react-icons/fi';
import './Inventory.css';

function Inventory() {
  const [inventory] = useState([
    { id: 1, name: 'Paracetamol 500mg', quantity: 150, minStock: 100, category: 'Medicine', status: 'adequate' },
    { id: 2, name: 'Bandages', quantity: 45, minStock: 50, category: 'Supplies', status: 'low' },
    { id: 3, name: 'ORS Packets', quantity: 200, minStock: 100, category: 'Medicine', status: 'adequate' },
    { id: 4, name: 'Antiseptic Solution', quantity: 20, minStock: 30, category: 'Supplies', status: 'low' },
    { id: 5, name: 'Thermometers', quantity: 10, minStock: 15, category: 'Equipment', status: 'low' },
    { id: 6, name: 'Iron Tablets', quantity: 300, minStock: 100, category: 'Medicine', status: 'adequate' },
    { id: 7, name: 'Folic Acid', quantity: 250, minStock: 100, category: 'Medicine', status: 'adequate' },
    { id: 8, name: 'Glucose', quantity: 5, minStock: 20, category: 'Medicine', status: 'critical' }
  ]);

  const lowStockItems = inventory.filter(item => item.status === 'low' || item.status === 'critical');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Monitor and manage medical supplies</p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="alert-banner">
          <FiAlertCircle />
          <span>{lowStockItems.length} items are running low on stock</span>
        </div>
      )}

      <div className="inventory-stats">
        <div className="stat-card">
          <h3>{inventory.length}</h3>
          <p>Total Items</p>
        </div>
        <div className="stat-card">
          <h3>{inventory.filter(i => i.status === 'adequate').length}</h3>
          <p>Adequate Stock</p>
        </div>
        <div className="stat-card warning">
          <h3>{inventory.filter(i => i.status === 'low').length}</h3>
          <p>Low Stock</p>
        </div>
        <div className="stat-card critical">
          <h3>{inventory.filter(i => i.status === 'critical').length}</h3>
          <p>Critical</p>
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className={item.status}>
                <td>
                  <div className="item-name">
                    <FiPackage />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.minStock}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {(item.status === 'low' || item.status === 'critical') && (
                    <button className="btn-small btn-warning">Request Restock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
