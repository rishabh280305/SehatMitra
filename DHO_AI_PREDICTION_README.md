# DHO & Hospital Admin AI Supply Prediction System

## Overview
This system uses AI to predict supply shortages for District Health Officers (DHO) and Hospital Admins based on real-world data sources:
- **Weather API** (OpenWeatherMap) - Predicts disease outbreaks based on temperature, humidity, rainfall
- **AQI API** - Forecasts respiratory illness surges from air quality
- **News API** - Detects disasters and emergencies (earthquakes, floods) for preparedness

## Database Setup

### Run the Seeder
```bash
cd backend
node seedDHOData.js
```

This creates:
- **1 District Health Officer** (DHO)
- **3 Hospital Administrators**
- **3 Doctors** across hospitals
- **3 Hospitals** with full bed management
- **150 Stock Entries** (50 medicines × 3 hospitals)
- **3 AI-Predicted Supply Requests**

### Created Data

#### District Health Officer
- **Name**: Dr. Rajesh Patel
- **Email**: dr.rajesh.patel@dho.gov.in
- **Password**: Password123!
- **District**: Mumbai
- **Role**: Approve/reject supply requests, monitor predictions

#### Hospital Administrators
| Hospital | Admin Name | Email | Phone |
|----------|------------|-------|-------|
| City General Hospital | Priya Kapoor | priya.kapoor@cityhospital.com | 9876543290 |
| District Medical Center | Amit Desai | amit.desai@districthospital.com | 9876543300 |
| Community Health Center | Kavita Reddy | kavita.reddy@communityhospital.com | 9876543310 |

**Password for all**: Password123!

#### Doctors
| Name | Specialization | Hospital | Email |
|------|----------------|----------|-------|
| Dr. Arun Mehta | General Physician | City General Hospital | dr.arun.mehta@cityhospital.com |
| Dr. Sneha Iyer | Pediatrician | District Medical Center | dr.sneha.iyer@districthospital.com |
| Dr. Ramesh Kumar | Gynecologist | Community Health Center | dr.ramesh.kumar@communityhospital.com |

**Password for all**: Password123!

#### Hospitals Created
1. **City General Hospital**
   - Capacity: 500 beds (380 occupied)
   - Emergency: 50 beds (35 occupied)
   - ICU: 30 beds (22 occupied)
   - Staff: 120 nurses, 45 technicians, 80 support
   - Facilities: Emergency, ICU, Operation Theater, Blood Bank, Laboratory, Radiology, Pharmacy

2. **District Medical Center**
   - Capacity: 300 beds (250 occupied)
   - Emergency: 30 beds (20 occupied)
   - ICU: 20 beds (15 occupied)
   - Staff: 80 nurses, 30 technicians, 50 support
   - Facilities: Emergency, ICU, Operation Theater, Laboratory, Pharmacy, Maternity Ward

3. **Community Health Center**
   - Capacity: 150 beds (100 occupied)
   - Emergency: 15 beds (10 occupied)
   - ICU: 10 beds (6 occupied)
   - Staff: 40 nurses, 15 technicians, 25 support
   - Facilities: Emergency, ICU, Laboratory, Pharmacy, Maternity Ward, Pediatric Ward

## Medicine Stock Inventory

Each hospital has 50 types of essential medicines:

### Categories
- **Analgesics**: Paracetamol, Ibuprofen
- **Antibiotics**: Amoxicillin, Azithromycin, Ciprofloxacin
- **Diabetes**: Metformin, Glimepiride, Insulin
- **Cardiovascular**: Amlodipine, Atenolol, Enalapril
- **Respiratory**: Salbutamol Inhaler, Budesonide Inhaler
- **Antimalarial**: Chloroquine, Artemether
- **Hydration**: ORS Packets, IV Saline, Ringer Lactate, Glucose
- **Vitamins & Minerals**: Vitamin B Complex, Iron + Folic Acid, Calcium, Zinc
- **Vaccines**: Tetanus Toxoid, Polio, Measles, BCG, Hepatitis B
- **Supplies**: Bandages, Gauze, Cotton, Syringes, IV Cannula, Gloves, Masks, Sanitizer
- **Equipment**: Thermometers, BP Apparatus, Pulse Oximeter

### Stock Status
- **Sufficient**: Stock above 60% of minimum threshold
- **Low**: Stock between 30-60% of minimum
- **Critical**: Stock below 30% of minimum
- **Out of Stock**: Zero stock

## AI Prediction System

### How It Works
1. **Weather Data**: Fetches 48-hour forecast for district
2. **AQI Data**: Gets current air quality index and PM2.5/PM10 levels
3. **News Data**: Searches for health emergencies and disasters
4. **Analysis**: AI analyzes all data sources to predict:
   - Disease outbreaks
   - Patient surge scenarios
   - Supply shortages
   - Emergency preparedness needs

### Prediction Types

#### 1. Waterborne Disease (Dengue/Malaria)
**Triggers**: Rainfall + Humidity >70%
**Medicines Affected**:
- Paracetamol 500mg
- IV Saline 500ml
- ORS Packets
- Chloroquine 250mg

**Actions**:
- Stock antipyretic medicines
- Ensure IV fluid supplies
- Prepare ORS packets
- Alert hospitals

#### 2. Heat-Related Illness
**Triggers**: Temperature >35°C
**Medicines Affected**:
- ORS Packets
- IV Saline 500ml
- Glucose 5% 500ml

**Actions**:
- Stock hydration solutions
- Prepare cooling equipment
- Alert emergency services

#### 3. Respiratory Diseases
**Triggers**: AQI ≥3 or PM2.5 >50
**Medicines Affected**:
- Salbutamol Inhaler (Critical)
- Budesonide Inhaler
- Prednisolone 5mg
- Amoxicillin 500mg

**Actions**:
- Stock inhalers urgently
- Prepare nebulizers and oxygen
- Issue public health advisory
- Coordinate with pulmonology

#### 4. Emergency Preparedness
**Triggers**: News about earthquakes, floods, disasters
**Medicines Affected**:
- Tetanus Toxoid
- Bandages (Sterile)
- Antiseptic Solution
- IV Saline 500ml
- Amoxicillin 500mg

**Actions**:
- Activate emergency teams
- Stock trauma care supplies
- Coordinate with disaster management
- Prepare evacuation protocols

## API Endpoints

### DHO Endpoints

#### Get AI Predictions
```
GET /api/v1/dho/ai-predictions/:district
Authorization: Bearer <token>

Response:
{
  "success": true,
  "predictions": [...],
  "weather": { "temperature": 32, "humidity": 75, "rainfall": true },
  "aqi": { "aqi": 3, "pm25": 85, "category": "Moderate" },
  "news": { "articles": [...], "hasEmergency": true },
  "dataSources": { "weather": true, "aqi": true, "news": true },
  "generatedAt": "2025-01-15T..."
}
```

#### Get Stock Requests
```
GET /api/v1/dho/requests/:district?status=pending
Authorization: Bearer <token>

Response:
[
  {
    "_id": "...",
    "requestedBy": { "fullName": "Priya Kapoor", "role": "hospital_admin" },
    "items": [
      {
        "itemName": "Paracetamol 500mg",
        "requestedQuantity": 2500,
        "urgency": "high",
        "reason": "Predicted dengue outbreak..."
      }
    ],
    "status": "pending",
    "aiRecommendation": {
      "recommended": true,
      "confidence": 87,
      "reasoning": "..."
    }
  }
]
```

#### Approve Request
```
PUT /api/v1/dho/requests/:id/approve
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Request approved successfully"
}
```

#### Reject Request
```
PUT /api/v1/dho/requests/:id/reject
Authorization: Bearer <token>
Body: { "rejectionReason": "Insufficient budget" }

Response:
{
  "success": true,
  "message": "Request rejected"
}
```

#### Get Hospitals
```
GET /api/v1/dho/hospitals/:district
Authorization: Bearer <token>

Response:
[
  {
    "_id": "...",
    "hospitalName": "City General Hospital",
    "beds": { "total": 500, "occupied": 380, "available": 120 },
    "facilities": [...],
    "staff": { "nurses": 120, "technicians": 45 }
  }
]
```

#### Get District Stock Summary
```
GET /api/v1/dho/stocks/:district
Authorization: Bearer <token>

Response:
[
  {
    "itemName": "Paracetamol 500mg",
    "totalStock": 12500,
    "totalThreshold": 10000,
    "unit": "Tablets",
    "hospitals": [
      { "hospital": "City General Hospital", "stock": 5000, "status": "sufficient" },
      { "hospital": "District Medical Center", "stock": 4500, "status": "low" },
      { "hospital": "Community Health Center", "stock": 3000, "status": "critical" }
    ]
  }
]
```

#### Dashboard Stats
```
GET /api/v1/dho/dashboard/:district
Authorization: Bearer <token>

Response:
{
  "hospitals": 3,
  "pendingRequests": 3,
  "beds": {
    "total": 950,
    "occupied": 730,
    "available": 220,
    "occupancyRate": 77
  },
  "criticalStocks": 5
}
```

## Frontend Access

### DHO Portal
- **URL**: `/dho-app`
- **Login**: dr.rajesh.patel@dho.gov.in / Password123!

#### Pages:
1. **Dashboard** - Overview stats, critical alerts
2. **AI Predictions** - Real-time weather/AQI/news-based predictions
3. **Stock Requests** - Pending approval queue
4. **Hospitals** - District hospital management
5. **Analytics** - Historical trends and patterns

### Hospital Admin Portal
- **URL**: `/hospital-admin-app`
- **Login**: Use any hospital admin email above

#### Pages:
1. **Dashboard** - Hospital overview
2. **Bed Management** - ICU, Emergency, General beds
3. **Inventory** - Medicine stock levels
4. **Stock Requests** - Submit new requests
5. **Doctor Rotation** - Staff scheduling

## AI Prediction Examples

### Example 1: Monsoon Season
**Data**:
- Weather: 30°C, 85% humidity, heavy rain
- AQI: 2 (Fair)
- News: Normal

**Prediction**:
- **Category**: Waterborne Diseases
- **Disease**: Dengue/Malaria
- **Severity**: High
- **Probability**: 85%
- **Timeframe**: 48 hours

**Actions**:
- Auto-generates stock request for Paracetamol, ORS, IV Saline
- DHO receives notification
- Request includes AI confidence score (85%)

### Example 2: Pollution Spike
**Data**:
- Weather: 35°C, 40% humidity
- AQI: 4 (Poor), PM2.5: 120 μg/m³
- News: Normal

**Prediction**:
- **Category**: Respiratory Diseases
- **Disease**: Asthma/COPD/Bronchitis
- **Severity**: Critical
- **Probability**: 90%
- **Timeframe**: Immediate

**Actions**:
- Critical alert to DHO
- Auto-requests inhalers, bronchodilators
- Public health advisory recommendation

### Example 3: Earthquake Alert
**Data**:
- Weather: Normal
- AQI: Normal
- News: "7.2 magnitude earthquake strikes near Mumbai"

**Prediction**:
- **Category**: Emergency Preparedness
- **Disease**: Disaster Response
- **Severity**: Critical
- **Probability**: 95%
- **Timeframe**: Immediate

**Actions**:
- Emergency medical response activation
- Trauma supplies requested (Tetanus, Bandages, Antiseptics)
- Disaster management coordination
- Evacuation protocol preparation

## Environment Variables

Add to `backend/.env`:
```env
WEATHER_API_KEY=96fba61e96c4f6b2e5b7e97df44a8f0e
NEWS_API_KEY=b8ba9c5d3ead4b4f96d5f0d2e5c4e3a2
MONGODB_URI=mongodb://localhost:27017/sehatmitra
```

## Testing the System

### 1. Seed Database
```bash
cd backend
node seedDHOData.js
```

### 2. Start Backend
```bash
npm run dev
```

### 3. Login as DHO
- Email: dr.rajesh.patel@dho.gov.in
- Password: Password123!

### 4. View AI Predictions
Navigate to "AI Predictions" page to see real-time weather, AQI, and news-based forecasts

### 5. Review Stock Requests
Check "Stock Requests" page for AI-generated shortage alerts

### 6. Approve/Reject Requests
DHO can approve or reject with reasons

## Features Completed

✅ **Database Seeding**
- DHO, Hospital Admins, Doctors
- 3 Hospitals with beds and facilities
- 150 medicine stock entries
- AI-predicted stock requests

✅ **AI Prediction Engine**
- Weather API integration (OpenWeatherMap)
- AQI API integration
- News API for disasters
- Dynamic shortage predictions
- Confidence scoring

✅ **DHO Routes**
- AI predictions endpoint
- Stock request management
- Hospital monitoring
- Dashboard analytics
- Approval/rejection workflow

✅ **Frontend Pages**
- DHO AI Predictions page
- Stock Requests management
- Hospital overview
- Dashboard with stats

✅ **Supply Request System**
- Auto-generation based on AI
- DHO approval workflow
- Priority/urgency levels
- Rejection with reasons

## Next Steps (Optional Enhancements)

- **SMS Alerts**: Send critical alerts to DHO phone
- **Email Notifications**: Auto-email for critical shortages
- **Mobile App**: DHO mobile dashboard
- **Historical Analytics**: Prediction accuracy tracking
- **Auto-Ordering**: Direct integration with suppliers
- **Multi-District**: Support for state-level coordination
- **Real-time Updates**: WebSocket for live predictions

## Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Verify seeder ran successfully
- Ensure MongoDB is running
- Check API keys are valid
- Test endpoints with Postman
