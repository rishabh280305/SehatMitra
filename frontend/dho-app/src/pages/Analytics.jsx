import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { FiTrendingUp, FiCalendar } from 'react-icons/fi'
import './Analytics.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [analyticsData, setAnalyticsData] = useState({
    requestTrend: [],
    statusDistribution: {},
    topItems: [],
    hospitalRequests: []
  })
  
  const district = user?.district || 'Mumbai'
  
  useEffect(() => {
    fetchAnalytics()
  }, [district, timeRange])
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Fetch requests for analytics
      const response = await axios.get(`${API_URL}/dho/requests/${district}`)
      const requests = response.data || []
      
      // Process analytics data
      const statusDist = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        fulfilled: requests.filter(r => r.status === 'fulfilled').length
      }
      
      // Group by date for trend
      const dateGroups = {}
      requests.forEach(req => {
        const date = new Date(req.createdAt).toLocaleDateString()
        dateGroups[date] = (dateGroups[date] || 0) + 1
      })
      
      // Top requested items
      const itemCounts = {}
      requests.forEach(req => {
        req.items?.forEach(item => {
          const name = item.itemName.toLowerCase()
          itemCounts[name] = (itemCounts[name] || 0) + item.requestedQuantity
        })
      })
      const topItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
      
      setAnalyticsData({
        requestTrend: Object.entries(dateGroups).slice(-14).map(([date, count]) => ({ date, count })),
        statusDistribution: statusDist,
        topItems,
        totalRequests: requests.length
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const lineChartData = {
    labels: analyticsData.requestTrend.map(d => d.date),
    datasets: [{
      label: 'Requests',
      data: analyticsData.requestTrend.map(d => d.count),
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1'
    }]
  }
  
  const doughnutData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
    datasets: [{
      data: [
        analyticsData.statusDistribution.pending || 0,
        analyticsData.statusDistribution.approved || 0,
        analyticsData.statusDistribution.rejected || 0,
        analyticsData.statusDistribution.fulfilled || 0
      ],
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6366f1'],
      borderWidth: 0
    }]
  }
  
  const barChartData = {
    labels: analyticsData.topItems.map(i => i.name.slice(0, 15)),
    datasets: [{
      label: 'Quantity Requested',
      data: analyticsData.topItems.map(i => i.count),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6
    }]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } }
      }
    }
  }
  
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    cutout: '65%'
  }
  
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }
  
  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>District Analytics</h1>
          <p>Comprehensive insights into supply requests and distribution patterns</p>
        </div>
        <div className="time-filter">
          <FiCalendar />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="stats-row">
        <div className="stat-card compact">
          <span className="stat-value">{analyticsData.totalRequests || 0}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card compact">
          <span className="stat-value">{analyticsData.statusDistribution.pending || 0}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card compact">
          <span className="stat-value">{analyticsData.statusDistribution.approved || 0}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card compact">
          <span className="stat-value">
            {analyticsData.totalRequests > 0 
              ? Math.round((analyticsData.statusDistribution.approved / analyticsData.totalRequests) * 100)
              : 0}%
          </span>
          <span className="stat-label">Approval Rate</span>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card wide">
          <div className="chart-header">
            <h3><FiTrendingUp /> Request Trend</h3>
          </div>
          <div className="chart-body">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h3>Status Distribution</h3>
          </div>
          <div className="chart-body doughnut">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Top Requested Items</h3>
          </div>
          <div className="chart-body">
            {analyticsData.topItems.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="no-data">No item data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
