import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiActivity, FiTrendingUp, FiTrendingDown, FiRefreshCw,
  FiPackage, FiAlertTriangle, FiCheckCircle, FiInfo,
  FiCloud, FiWind, FiThermometer, FiDroplet
} from 'react-icons/fi'
import './AIPredictions.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehatmitra-backend.vercel.app/api/v1'

export default function AIPredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [dataSources, setDataSources] = useState({})
  const [generatedAt, setGeneratedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  const district = user?.district || 'Test District'
  
  useEffect(() => {
    fetchPredictions()
  }, [district])
  
  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/dho/ai-predictions/${district}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setPredictions(response.data.predictions || [])
        setDataSources(response.data.dataSources || {})
        setGeneratedAt(response.data.generatedAt)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
      toast.error('Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }
  
  const generateNewPredictions = async () => {
    try {
      setGenerating(true)
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/dho/ai-predictions/regenerate/${district}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setPredictions(response.data.predictions || [])
        setGeneratedAt(response.data.generatedAt)
        toast.success('Predictions regenerated with latest data')
      }
    } catch (error) {
      toast.error('Failed to generate predictions')
    } finally {
      setGenerating(false)
    }
  }
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#ca8a04'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical': return { bg: '#fef2f2', color: '#dc2626', text: 'Critical Shortage' }
      case 'shortage_risk': return { bg: '#fff7ed', color: '#ea580c', text: 'Shortage Risk' }
      case 'adequate': return { bg: '#f0fdf4', color: '#16a34a', text: 'Adequate' }
      default: return { bg: '#f3f4f6', color: '#6b7280', text: status }
    }
  }
  
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="ai-predictions-page">
      <div className="page-header">
        <div>
          <h1>AI Disease Predictions</h1>
          <p>48-hour predictions based on weather, AQI, and news data for {district}</p>
          {generatedAt && (
            <span className="generated-time">Last updated: {formatDate(generatedAt)}</span>
          )}
        </div>
        <button 
          className="btn btn-primary"
          onClick={generateNewPredictions}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner-small"></span>
              Analyzing...
            </>
          ) : (
            <>
              <FiRefreshCw />
              Refresh Predictions
            </>
          )}
        </button>
      </div>
      
      {/* Data Sources Status */}
      <div className="data-sources-banner">
        <div className="data-source">
          <FiCloud />
          <span>Weather API</span>
          <span className={`status-dot ${dataSources.weather ? 'active' : ''}`}></span>
        </div>
        <div className="data-source">
          <FiWind />
          <span>AQI Data</span>
          <span className={`status-dot ${dataSources.aqi ? 'active' : ''}`}></span>
        </div>
        <div className="data-source">
          <FiInfo />
          <span>News Alerts</span>
          <span className={`status-dot ${dataSources.news ? 'active' : ''}`}></span>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card critical">
          <div className="summary-icon">
            <FiAlertTriangle />
          </div>
          <div className="summary-info">
            <span className="summary-value">
              {predictions.filter(p => p.severity === 'critical' || p.severity === 'high').length}
            </span>
            <span className="summary-label">High Priority Alerts</span>
          </div>
        </div>
        
        <div className="summary-card warning">
          <div className="summary-icon">
            <FiActivity />
          </div>
          <div className="summary-info">
            <span className="summary-value">
              {predictions.reduce((sum, p) => sum + (p.affectedMedicines?.filter(m => m.status === 'critical' || m.status === 'shortage_risk').length || 0), 0)}
            </span>
            <span className="summary-label">Medicine Shortages</span>
          </div>
        </div>
        
        <div className="summary-card info">
          <div className="summary-icon">
            <FiPackage />
          </div>
          <div className="summary-info">
            <span className="summary-value">{predictions.length}</span>
            <span className="summary-label">Active Predictions</span>
          </div>
        </div>
      </div>
      
      {/* Predictions List */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analyzing weather, AQI, and news data...</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className="empty-state">
          <FiActivity />
          <h3>No Predictions Available</h3>
          <p>Unable to generate predictions. Please try refreshing.</p>
        </div>
      ) : (
        <div className="predictions-list">
          {predictions.map((prediction, idx) => (
            <div 
              key={prediction.id || idx} 
              className={`prediction-card severity-${prediction.severity}`}
              style={{ borderLeftColor: getSeverityColor(prediction.severity) }}
            >
              <div className="prediction-header-section">
                <div className="prediction-category">
                  <span 
                    className="severity-badge"
                    style={{ 
                      backgroundColor: getSeverityColor(prediction.severity) + '20',
                      color: getSeverityColor(prediction.severity)
                    }}
                  >
                    {prediction.severity?.toUpperCase()}
                  </span>
                  <h3>{prediction.category}</h3>
                </div>
                <div className="prediction-meta">
                  <span className="timeframe">{prediction.timeframe} forecast</span>
                  <span className="confidence">
                    {prediction.confidence}% confidence
                  </span>
                </div>
              </div>
              
              <div className="prediction-condition">
                <strong>Expected Conditions:</strong> {prediction.condition}
              </div>
              
              <div className="prediction-increase">
                <FiTrendingUp />
                <span>Predicted increase in cases: <strong>+{prediction.predictedIncrease}%</strong></span>
              </div>
              
              {/* Weather/AQI Data */}
              {prediction.weatherData && (
                <div className="environmental-data">
                  <div className="env-item">
                    <FiThermometer />
                    <span>{prediction.weatherData.temperature}C</span>
                  </div>
                  <div className="env-item">
                    <FiDroplet />
                    <span>{prediction.weatherData.humidity}% humidity</span>
                  </div>
                  <div className="env-item">
                    <FiCloud />
                    <span>{prediction.weatherData.condition}</span>
                  </div>
                </div>
              )}
              
              {prediction.aqiData && (
                <div className="environmental-data aqi">
                  <div className="env-item">
                    <FiWind />
                    <span>AQI: {prediction.aqiData.aqi}</span>
                  </div>
                  <div className="env-item">
                    <span>PM2.5: {prediction.aqiData.pm25}</span>
                  </div>
                  <div className="env-item">
                    <span>PM10: {prediction.aqiData.pm10}</span>
                  </div>
                </div>
              )}
              
              {/* Factors */}
              <div className="prediction-factors">
                <strong>Contributing Factors:</strong>
                <ul>
                  {prediction.factors?.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>
              
              {/* Affected Medicines */}
              {prediction.affectedMedicines && prediction.affectedMedicines.length > 0 && (
                <div className="affected-medicines">
                  <strong>Medicine Stock Impact:</strong>
                  <div className="medicine-list">
                    {prediction.affectedMedicines.map((med, i) => {
                      const badge = getStatusBadge(med.status)
                      return (
                        <div key={i} className="medicine-item">
                          <div className="medicine-name">{med.name}</div>
                          <div className="medicine-stock">
                            <span>Current: {med.currentStock}</span>
                            <span>Predicted Need: {med.predictedDemand}</span>
                          </div>
                          <span 
                            className="medicine-status"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.text}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              <div className="prediction-recommendations">
                <strong>Recommended Actions:</strong>
                <ul>
                  {prediction.recommendations?.map((rec, i) => (
                    <li key={i}>
                      <FiCheckCircle />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* News Alerts */}
              {prediction.newsAlerts && prediction.newsAlerts.length > 0 && (
                <div className="news-alerts">
                  <strong>Related News:</strong>
                  {prediction.newsAlerts.map((news, i) => (
                    <div key={i} className="news-item">{news}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
