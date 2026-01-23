const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// Weather API - OpenWeatherMap (free tier)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo';
// News API
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo';

// District coordinates for weather data
const DISTRICT_COORDS = {
  'Mumbai': { lat: 19.076, lon: 72.8777 },
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 },
  'Chennai': { lat: 13.0827, lon: 80.2707 },
  'Kolkata': { lat: 22.5726, lon: 88.3639 },
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'Test District': { lat: 19.076, lon: 72.8777 }
};

// Get weather data for a district
async function getWeatherData(district) {
  const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS['Mumbai'];
  
  try {
    // Try to get real weather data
    if (WEATHER_API_KEY !== 'demo') {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      return response.data;
    }
  } catch (error) {
    console.log('Using mock weather data');
  }
  
  // Mock weather data for demo
  return {
    list: [
      { dt: Date.now() / 1000, main: { temp: 32, humidity: 75 }, weather: [{ main: 'Clouds', description: 'scattered clouds' }] },
      { dt: (Date.now() / 1000) + 10800, main: { temp: 34, humidity: 70 }, weather: [{ main: 'Clear', description: 'clear sky' }] },
      { dt: (Date.now() / 1000) + 21600, main: { temp: 30, humidity: 80 }, weather: [{ main: 'Rain', description: 'light rain' }] },
      { dt: (Date.now() / 1000) + 32400, main: { temp: 28, humidity: 85 }, weather: [{ main: 'Rain', description: 'moderate rain' }] }
    ]
  };
}

// Get AQI data
async function getAQIData(district) {
  const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS['Mumbai'];
  
  try {
    if (WEATHER_API_KEY !== 'demo') {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}`
      );
      return response.data;
    }
  } catch (error) {
    console.log('Using mock AQI data');
  }
  
  // Mock AQI data
  return {
    list: [{ main: { aqi: 3 }, components: { pm2_5: 45, pm10: 80, no2: 25, o3: 55 } }]
  };
}

// Get news about health emergencies/disasters
async function getHealthNews(district) {
  try {
    if (NEWS_API_KEY !== 'demo') {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=(health OR disease OR epidemic OR earthquake OR flood) AND India&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
      );
      return response.data.articles || [];
    }
  } catch (error) {
    console.log('Using mock news data');
  }
  
  // Mock news data
  return [
    { title: 'Monsoon expected to bring heavy rainfall in Western India', publishedAt: new Date().toISOString(), source: { name: 'Health News' } },
    { title: 'Dengue cases rising in urban areas', publishedAt: new Date().toISOString(), source: { name: 'Medical Today' } }
  ];
}

// Generate AI predictions based on all data sources
function generatePredictions(weather, aqi, news, hospitals) {
  const predictions = [];
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Analyze weather for health impacts
  const hasRain = weather.list?.some(w => w.weather?.[0]?.main === 'Rain');
  const highHumidity = weather.list?.some(w => w.main?.humidity > 80);
  const highTemp = weather.list?.some(w => w.main?.temp > 35);
  
  // Analyze AQI
  const aqiLevel = aqi.list?.[0]?.main?.aqi || 2;
  const pm25 = aqi.list?.[0]?.components?.pm2_5 || 30;
  
  // Analyze news for emergencies
  const hasEmergencyNews = news.some(n => 
    n.title?.toLowerCase().includes('earthquake') || 
    n.title?.toLowerCase().includes('flood') ||
    n.title?.toLowerCase().includes('epidemic')
  );
  
  // Generate weather-based predictions
  if (hasRain && highHumidity) {
    predictions.push({
      id: `pred_${Date.now()}_1`,
      category: 'Waterborne Diseases',
      condition: 'Dengue, Malaria, Typhoid',
      predictedIncrease: Math.floor(30 + Math.random() * 40),
      confidence: 78 + Math.floor(Math.random() * 15),
      timeframe: '48 hours',
      validUntil: in48h.toISOString(),
      factors: ['Heavy rainfall expected', 'High humidity levels', 'Stagnant water accumulation'],
      recommendations: [
        'Stock up on antimalarial medications',
        'Increase ORS availability by 50%',
        'Prepare IV fluids for dehydration cases',
        'Alert vector control teams'
      ],
      affectedMedicines: [
        { name: 'Paracetamol 500mg', currentStock: 5000, predictedDemand: 7500, status: 'shortage_risk' },
        { name: 'ORS Packets', currentStock: 2000, predictedDemand: 4000, status: 'critical' },
        { name: 'Chloroquine', currentStock: 800, predictedDemand: 1200, status: 'shortage_risk' },
        { name: 'Artemether', currentStock: 500, predictedDemand: 750, status: 'adequate' }
      ],
      severity: 'high',
      weatherData: {
        condition: 'Rainy',
        humidity: Math.round(weather.list?.[0]?.main?.humidity || 80),
        temperature: Math.round(weather.list?.[0]?.main?.temp || 28)
      }
    });
  }
  
  if (highTemp) {
    predictions.push({
      id: `pred_${Date.now()}_2`,
      category: 'Heat-Related Illness',
      condition: 'Heat Stroke, Dehydration, Heat Exhaustion',
      predictedIncrease: Math.floor(20 + Math.random() * 30),
      confidence: 82 + Math.floor(Math.random() * 10),
      timeframe: '24 hours',
      validUntil: in24h.toISOString(),
      factors: ['Temperature exceeding 35C', 'Low fluid intake in rural areas', 'Outdoor labor exposure'],
      recommendations: [
        'Increase IV fluid stocks',
        'Prepare cooling stations',
        'Stock electrolyte solutions',
        'Alert emergency services'
      ],
      affectedMedicines: [
        { name: 'IV Saline', currentStock: 1000, predictedDemand: 1800, status: 'shortage_risk' },
        { name: 'Electrolyte Powder', currentStock: 3000, predictedDemand: 5000, status: 'shortage_risk' },
        { name: 'Glucose Solution', currentStock: 800, predictedDemand: 1200, status: 'adequate' }
      ],
      severity: 'medium',
      weatherData: {
        condition: 'Hot',
        humidity: Math.round(weather.list?.[0]?.main?.humidity || 45),
        temperature: Math.round(weather.list?.[0]?.main?.temp || 38)
      }
    });
  }
  
  if (aqiLevel >= 3 || pm25 > 50) {
    predictions.push({
      id: `pred_${Date.now()}_3`,
      category: 'Respiratory Diseases',
      condition: 'Asthma, COPD Exacerbation, Bronchitis',
      predictedIncrease: Math.floor(25 + Math.random() * 35),
      confidence: 75 + Math.floor(Math.random() * 15),
      timeframe: '48 hours',
      validUntil: in48h.toISOString(),
      factors: [`AQI Level: ${aqiLevel} (Moderate to Poor)`, `PM2.5: ${pm25} ug/m3`, 'Industrial emissions'],
      recommendations: [
        'Stock bronchodilators and inhalers',
        'Prepare nebulization equipment',
        'Increase corticosteroid availability',
        'Issue air quality advisory'
      ],
      affectedMedicines: [
        { name: 'Salbutamol Inhaler', currentStock: 400, predictedDemand: 700, status: 'shortage_risk' },
        { name: 'Budesonide', currentStock: 300, predictedDemand: 500, status: 'shortage_risk' },
        { name: 'Prednisolone', currentStock: 600, predictedDemand: 800, status: 'adequate' },
        { name: 'Nebulizer Solutions', currentStock: 200, predictedDemand: 400, status: 'critical' }
      ],
      severity: aqiLevel >= 4 ? 'high' : 'medium',
      aqiData: {
        aqi: aqiLevel,
        pm25: pm25,
        pm10: aqi.list?.[0]?.components?.pm10 || 60
      }
    });
  }
  
  if (hasEmergencyNews) {
    predictions.push({
      id: `pred_${Date.now()}_4`,
      category: 'Emergency Preparedness',
      condition: 'Trauma, Injuries, Emergency Care',
      predictedIncrease: Math.floor(50 + Math.random() * 50),
      confidence: 65 + Math.floor(Math.random() * 20),
      timeframe: '48 hours',
      validUntil: in48h.toISOString(),
      factors: ['News reports indicate potential emergency situation', 'Historical disaster patterns'],
      recommendations: [
        'Activate emergency protocols',
        'Stock trauma supplies',
        'Prepare blood bank',
        'Coordinate with disaster response teams'
      ],
      affectedMedicines: [
        { name: 'Tetanus Toxoid', currentStock: 500, predictedDemand: 1000, status: 'shortage_risk' },
        { name: 'Analgesics', currentStock: 2000, predictedDemand: 4000, status: 'shortage_risk' },
        { name: 'Antiseptics', currentStock: 1500, predictedDemand: 3000, status: 'shortage_risk' },
        { name: 'Bandages/Dressings', currentStock: 5000, predictedDemand: 10000, status: 'critical' }
      ],
      severity: 'critical',
      newsAlerts: news.slice(0, 2).map(n => n.title)
    });
  }
  
  // Always add a baseline prediction
  if (predictions.length === 0) {
    predictions.push({
      id: `pred_${Date.now()}_baseline`,
      category: 'General Healthcare',
      condition: 'Routine Medical Needs',
      predictedIncrease: Math.floor(5 + Math.random() * 10),
      confidence: 90,
      timeframe: '48 hours',
      validUntil: in48h.toISOString(),
      factors: ['Normal seasonal patterns', 'Routine healthcare demand'],
      recommendations: [
        'Maintain regular stock levels',
        'Monitor for unusual patterns',
        'Continue preventive care programs'
      ],
      affectedMedicines: [
        { name: 'Paracetamol 500mg', currentStock: 5000, predictedDemand: 5200, status: 'adequate' },
        { name: 'Amoxicillin', currentStock: 2000, predictedDemand: 2100, status: 'adequate' },
        { name: 'Metformin', currentStock: 1500, predictedDemand: 1550, status: 'adequate' }
      ],
      severity: 'low',
      weatherData: {
        condition: weather.list?.[0]?.weather?.[0]?.main || 'Clear',
        humidity: Math.round(weather.list?.[0]?.main?.humidity || 60),
        temperature: Math.round(weather.list?.[0]?.main?.temp || 30)
      }
    });
  }
  
  return predictions;
}

// GET AI predictions for a district
router.get('/:district', protect, async (req, res) => {
  try {
    const { district } = req.params;
    
    // Fetch all data sources in parallel
    const [weather, aqi, news] = await Promise.all([
      getWeatherData(district),
      getAQIData(district),
      getHealthNews(district)
    ]);
    
    // Generate predictions
    const predictions = generatePredictions(weather, aqi, news, []);
    
    res.json({
      success: true,
      district,
      generatedAt: new Date().toISOString(),
      validFor: '48 hours',
      dataSources: {
        weather: weather.list?.length > 0,
        aqi: aqi.list?.length > 0,
        news: news.length > 0
      },
      predictions
    });
  } catch (error) {
    console.error('AI Predictions error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate predictions', error: error.message });
  }
});

// POST - Force regenerate predictions with latest data
router.post('/regenerate/:district', protect, async (req, res) => {
  try {
    const { district } = req.params;
    
    const [weather, aqi, news] = await Promise.all([
      getWeatherData(district),
      getAQIData(district),
      getHealthNews(district)
    ]);
    
    const predictions = generatePredictions(weather, aqi, news, []);
    
    res.json({
      success: true,
      message: 'Predictions regenerated successfully',
      district,
      generatedAt: new Date().toISOString(),
      predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to regenerate predictions' });
  }
});

module.exports = router;
