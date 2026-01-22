import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiImage } from 'react-icons/fi';
import './AIAnalysis.css';

function AIAnalysis() {
  const [analysisType, setAnalysisType] = useState('symptoms');
  const [inputData, setInputData] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!inputData.trim()) {
      toast.error('Please provide input for analysis');
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        diagnosis: 'Based on the symptoms described, this could indicate a viral infection.',
        confidence: '85%',
        recommendations: [
          'Rest and adequate hydration',
          'Monitor temperature regularly',
          'Over-the-counter antipyretics if needed',
          'Follow up if symptoms persist beyond 3 days'
        ],
        warnings: [
          'Watch for difficulty breathing',
          'Severe dehydration signs',
          'High fever above 103°F'
        ]
      });
      setAnalyzing(false);
      toast.success('AI analysis completed');
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI-Powered Analysis</h1>
        <p>Get intelligent insights for better diagnosis</p>
      </div>

      <div className="analysis-type-selector">
        <button
          className={`type-btn ${analysisType === 'symptoms' ? 'active' : ''}`}
          onClick={() => setAnalysisType('symptoms')}
        >
          Symptom Analysis
        </button>
        <button
          className={`type-btn ${analysisType === 'image' ? 'active' : ''}`}
          onClick={() => setAnalysisType('image')}
        >
          Medical Image Analysis
        </button>
        <button
          className={`type-btn ${analysisType === 'report' ? 'active' : ''}`}
          onClick={() => setAnalysisType('report')}
        >
          Report Analysis
        </button>
      </div>

      <div className="analysis-input-section">
        {analysisType === 'symptoms' && (
          <div className="input-area">
            <label>Patient Symptoms</label>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Describe patient symptoms, medical history, and current complaints..."
              rows="6"
            />
          </div>
        )}

        {analysisType === 'image' && (
          <div className="upload-area">
            <FiImage size={48} />
            <p>Upload X-ray, CT scan, or other medical image</p>
            <button className="btn-secondary">
              <FiUpload /> Choose Image
            </button>
          </div>
        )}

        {analysisType === 'report' && (
          <div className="upload-area">
            <FiUpload size={48} />
            <p>Upload medical report or lab results (PDF, Image)</p>
            <button className="btn-secondary">
              <FiUpload /> Choose File
            </button>
          </div>
        )}

        <button 
          onClick={handleAnalyze} 
          className="btn btn-primary"
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing with Gemini AI...' : 'Analyze with AI'}
        </button>
      </div>

      {result && (
        <div className="analysis-result">
          <div className="result-header">
            <h3>Analysis Results</h3>
            <span className="confidence-badge">Confidence: {result.confidence}</span>
          </div>

          <div className="result-section">
            <h4>Diagnosis</h4>
            <p>{result.diagnosis}</p>
          </div>

          <div className="result-section">
            <h4>Recommendations</h4>
            <ul>
              {result.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="result-section warnings">
            <h4>⚠️ Warning Signs to Monitor</h4>
            <ul>
              {result.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary">Create Prescription</button>
            <button className="btn-secondary">Save to Patient Record</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAnalysis;
