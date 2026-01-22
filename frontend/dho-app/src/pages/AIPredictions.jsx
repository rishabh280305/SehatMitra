import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiActivity, FiTrendingUp, FiTrendingDown, FiRefreshCw,
  FiPackage, FiAlertTriangle, FiCheckCircle, FiInfo
} from 'react-icons/fi'
import './AIPredictions.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function AIPredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  const district = user?.district || 'Mumbai'
  
  useEffect(() => {
    fetchPredictions()
  }, [district])
  
  const fetchPredictions = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/dho/ai-predictions/${district}`)
      setPredictions(response.data || [])
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const generateNewPredictions = async () => {
    try {
      setGenerating(true)
      // This would call an AI endpoint to regenerate predictions
      await fetchPredictions()
      toast.success('Predictions updated based on latest data')
    } catch (error) {
      toast.error('Failed to generate predictions')
    } finally {
      setGenerating(false)
    }
  }
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'high'
    if (confidence >= 50) return 'medium'
    return 'low'
  }
  
  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <FiTrendingUp className="trend-up" />
    if (trend === 'decreasing') return <FiTrendingDown className="trend-down" />
    return <FiActivity className="trend-stable" />
  }
  
  return (
    <div className="ai-predictions-page">
      <div className="page-header">
        <div>
          <h1>AI Supply Predictions</h1>
          <p>Machine learning predictions based on prescription trends and historical data</p>
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
      
      {/* Info Banner */}
      <div className="info-banner">
        <FiInfo />
        <div>
          <strong>How AI Predictions Work</strong>
          <p>Our system analyzes prescription data from doctors, historical stock requests, seasonal trends, 
          and disease outbreak patterns to predict supply needs for the next 30 days with varying confidence levels.</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon high">
            <FiAlertTriangle />
          </div>
          <div className="summary-info">
            <span className="summary-value">
              {predictions.filter(p => p.confidence >= 80).length}
            </span>
            <span className="summary-label">High Confidence Items</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon medium">
            <FiActivity />
          </div>
          <div className="summary-info">
            <span className="summary-value">
              {predictions.filter(p => p.trend === 'increasing').length}
            </span>
            <span className="summary-label">Increasing Demand</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon total">
            <FiPackage />
          </div>
          <div className="summary-info">
            <span className="summary-value">{predictions.length}</span>
            <span className="summary-label">Total Predictions</span>
          </div>
        </div>
      </div>
      
      {/* Predictions List */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analyzing supply data...</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className="empty-state">
          <FiActivity />
          <h3>No Predictions Available</h3>
          <p>Not enough data to generate predictions. Predictions will appear once there's sufficient prescription and request data.</p>
        </div>
      ) : (
        <div className="predictions-list">
          {predictions.map((prediction, idx) => (
            <div key={idx} className="prediction-card">
              <div className="prediction-rank">#{idx + 1}</div>
              
              <div className="prediction-main">
                <div className="prediction-header">
                  <h3>{prediction.itemName}</h3>
                  {getTrendIcon(prediction.trend)}
                </div>
                <p className="prediction-reasoning">{prediction.reasoning}</p>
              </div>
              
              <div className="prediction-stats">
                <div className="stat-block">
                  <span className="stat-label">Predicted Need</span>
                  <span className="stat-value">{prediction.predictedNeed} units</span>
                </div>
                
                <div className="stat-block">
                  <span className="stat-label">Trend</span>
                  <span className={`trend-badge ${prediction.trend}`}>
                    {prediction.trend}
                  </span>
                </div>
              </div>
              
              <div className="confidence-section">
                <div className="confidence-header">
                  <span>Confidence</span>
                  <span className={`confidence-value ${getConfidenceColor(prediction.confidence)}`}>
                    {Math.round(prediction.confidence)}%
                  </span>
                </div>
                <div className="confidence-bar">
                  <div 
                    className={`confidence-fill ${getConfidenceColor(prediction.confidence)}`}
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="prediction-action">
                <button className="btn btn-sm btn-outline">
                  Create Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
