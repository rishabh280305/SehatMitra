import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiPlus, FiMinus, FiPackage, FiAlertTriangle, FiSearch } from 'react-icons/fi'
import './Inventory.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

const CATEGORIES = ['Medicines', 'Equipment', 'Consumables', 'PPE', 'Emergency Supplies']

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Medicines',
    quantity: 0,
    unit: 'units',
    minStock: 10,
    expiryDate: ''
  })
  
  useEffect(() => {
    fetchInventory()
  }, [])
  
  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/hospital/inventory`)
      if (response.data?.inventory) {
        setInventory(response.data.inventory)
      } else {
        // Demo data
        setInventory([
          { _id: '1', name: 'Paracetamol 500mg', category: 'Medicines', quantity: 500, unit: 'tablets', minStock: 100, expiryDate: '2025-06-15' },
          { _id: '2', name: 'Surgical Masks', category: 'PPE', quantity: 2000, unit: 'pieces', minStock: 500, expiryDate: '2026-01-01' },
          { _id: '3', name: 'IV Drip Sets', category: 'Consumables', quantity: 45, unit: 'sets', minStock: 50, expiryDate: '2025-12-01' },
          { _id: '4', name: 'Oxygen Cylinders', category: 'Emergency Supplies', quantity: 8, unit: 'cylinders', minStock: 10, expiryDate: null },
          { _id: '5', name: 'Digital Thermometer', category: 'Equipment', quantity: 25, unit: 'pieces', minStock: 15, expiryDate: null },
          { _id: '6', name: 'Amoxicillin 250mg', category: 'Medicines', quantity: 120, unit: 'capsules', minStock: 200, expiryDate: '2025-03-20' },
          { _id: '7', name: 'Surgical Gloves', category: 'PPE', quantity: 3500, unit: 'pairs', minStock: 1000, expiryDate: '2025-08-01' },
          { _id: '8', name: 'Bandage Rolls', category: 'Consumables', quantity: 200, unit: 'rolls', minStock: 100, expiryDate: '2026-06-01' },
        ])
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getStockStatus = (item) => {
    if (item.quantity <= 0) return 'out-of-stock'
    if (item.quantity < item.minStock) return 'low-stock'
    return 'in-stock'
  }
  
  const updateQuantity = async (item, delta) => {
    const newQuantity = Math.max(0, item.quantity + delta)
    try {
      await axios.put(`${API_URL}/hospital/inventory/${item._id}`, { quantity: newQuantity })
      setInventory(prev => prev.map(i => 
        i._id === item._id ? { ...i, quantity: newQuantity } : i
      ))
      toast.success('Quantity updated')
    } catch (error) {
      // Update locally anyway for demo
      setInventory(prev => prev.map(i => 
        i._id === item._id ? { ...i, quantity: newQuantity } : i
      ))
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/hospital/inventory/${editingItem._id}`, formData)
        toast.success('Item updated successfully')
      } else {
        await axios.post(`${API_URL}/hospital/inventory`, formData)
        toast.success('Item added successfully')
      }
      fetchInventory()
      closeModal()
    } catch (error) {
      // Add locally for demo
      if (!editingItem) {
        setInventory(prev => [...prev, { ...formData, _id: Date.now().toString() }])
        toast.success('Item added successfully')
      }
      closeModal()
    }
  }
  
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minStock: item.minStock,
        expiryDate: item.expiryDate || ''
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        category: 'Medicines',
        quantity: 0,
        unit: 'units',
        minStock: 10,
        expiryDate: ''
      })
    }
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }
  
  const filteredInventory = inventory.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterCategory && item.category !== filterCategory) return false
    if (filterStatus) {
      const status = getStockStatus(item)
      if (filterStatus !== status) return false
    }
    return true
  })
  
  const lowStockCount = inventory.filter(i => getStockStatus(i) === 'low-stock').length
  const outOfStockCount = inventory.filter(i => getStockStatus(i) === 'out-of-stock').length
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    )
  }
  
  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track and manage hospital supplies</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Item
        </button>
      </div>
      
      {/* Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="inventory-alerts">
          {outOfStockCount > 0 && (
            <div className="alert alert-danger">
              <FiAlertTriangle />
              <span>{outOfStockCount} item(s) are out of stock!</span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="alert alert-warning">
              <FiAlertTriangle />
              <span>{lowStockCount} item(s) are running low on stock</span>
            </div>
          )}
        </div>
      )}
      
      {/* Search & Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>
      
      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const status = getStockStatus(item)
              return (
                <tr key={item._id} className={status}>
                  <td>
                    <div className="item-name">
                      <FiPackage />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td>
                    <div className="quantity-cell">
                      <span className="quantity-value">{item.quantity}</span>
                      <span className="quantity-unit">{item.unit}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${status}`}>
                      {status === 'in-stock' ? 'In Stock' : status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    {item.expiryDate ? (
                      <span className={new Date(item.expiryDate) < new Date() ? 'expired' : ''}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="qty-btn minus"
                        onClick={() => updateQuantity(item, -1)}
                        disabled={item.quantity <= 0}
                      >
                        <FiMinus />
                      </button>
                      <button 
                        className="qty-btn plus"
                        onClick={() => updateQuantity(item, 1)}
                      >
                        <FiPlus />
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => openModal(item)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {filteredInventory.length === 0 && (
        <div className="empty-state">
          <FiPackage size={48} />
          <p>No items found</p>
        </div>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. tablets, pieces"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
