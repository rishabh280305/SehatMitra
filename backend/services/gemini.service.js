const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Analyze patient symptoms and provide probable diagnosis
   * @param {Object} patientData - Patient information and symptoms
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeSymptomsForDiagnosis(patientData) {
    try {
      const { symptoms, chiefComplaints, duration, vitalSigns, medicalHistory } = patientData;
      
      const prompt = `You are an expert medical AI assistant helping in rural healthcare settings. 
      
Patient Information:
- Chief Complaints: ${chiefComplaints}
- Symptoms: ${symptoms?.join(', ') || 'Not specified'}
- Duration: ${duration || 'Not specified'}
${vitalSigns ? `
- Vital Signs:
  * Blood Pressure: ${vitalSigns.bloodPressure?.systolic}/${vitalSigns.bloodPressure?.diastolic} mmHg
  * Heart Rate: ${vitalSigns.heartRate?.value} bpm
  * Temperature: ${vitalSigns.temperature?.value}°${vitalSigns.temperature?.unit === 'celsius' ? 'C' : 'F'}
  * Oxygen Saturation: ${vitalSigns.oxygenSaturation?.value}%
` : ''}
${medicalHistory ? `- Medical History: ${medicalHistory}` : ''}

Please provide:
1. A concise summary of the patient's condition
2. Top 3 probable diagnoses with confidence levels (0-100%)
3. Recommended immediate actions or tests
4. Red flags or warning signs to watch for
5. General advice for the patient

Format your response as a structured JSON object with keys: summary, probableDiagnoses (array of {condition, confidence, reasoning}), recommendations (array), warningFlags (array), generalAdvice (string).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parsing failed, returning raw text');
      }
      
      return {
        summary: text,
        probableDiagnoses: [],
        recommendations: [],
        warningFlags: [],
        generalAdvice: text,
        rawResponse: text
      };
    } catch (error) {
      console.error('Gemini symptom analysis error:', error);
      throw new Error(`Failed to analyze symptoms: ${error.message}`);
    }
  }

  /**
   * Analyze medical report text (blood test, lab reports, etc.)
   * @param {Object} reportData - Medical report information
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeMedicalReport(reportData) {
    try {
      const { reportType, extractedText, testResults, reportName } = reportData;
      
      let prompt = `You are an expert medical AI assistant analyzing a ${reportType} report.

Report Name: ${reportName}
${extractedText ? `Report Content:\n${extractedText}\n` : ''}
${testResults && testResults.length > 0 ? `
Test Results:
${testResults.map(test => `- ${test.testName}: ${test.value} ${test.unit || ''} (Reference: ${test.referenceRange?.text || 'N/A'})`).join('\n')}
` : ''}

Please provide a comprehensive analysis including:
1. A clear summary of findings
2. Key abnormalities or concerns (if any)
3. Clinical significance of the results
4. Recommended follow-up actions
5. Patient-friendly explanation

Format your response as JSON with keys: summary, keyFindings (array of {finding, severity, explanation}), abnormalities (array), clinicalSignificance, recommendations (array), patientExplanation (string).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parsing failed, returning raw text');
      }
      
      return {
        summary: text,
        keyFindings: [],
        abnormalities: [],
        clinicalSignificance: 'normal',
        recommendations: [],
        patientExplanation: text,
        rawResponse: text
      };
    } catch (error) {
      console.error('Gemini report analysis error:', error);
      throw new Error(`Failed to analyze medical report: ${error.message}`);
    }
  }

  /**
   * Analyze medical images using Gemini Vision
   * @param {Object} imageData - Image information
   * @returns {Promise<Object>} Image analysis results
   */
  async analyzeMedicalImage(imageData) {
    try {
      const { imageUrl, imageType, reportType, patientInfo } = imageData;
      
      const prompt = `You are an expert medical AI assistant analyzing a medical image.

Image Type: ${imageType || 'Medical Image'}
Report Type: ${reportType || 'General Medical Imaging'}
${patientInfo ? `Patient Context: ${patientInfo}` : ''}

Please analyze this medical image and provide:
1. Description of what you observe
2. Any abnormalities or areas of concern
3. Probable conditions (with confidence levels)
4. Recommendations for further examination
5. IMPORTANT: Emphasize that this is AI-assisted analysis and must be reviewed by a qualified medical professional

Format response as JSON with keys: description, observations (array), abnormalities (array of {finding, location, severity}), probableConditions (array of {condition, confidence, reasoning}), recommendations (array), disclaimer (string).`;

      // Note: For actual image analysis, you need to fetch the image and convert to base64
      // This is a simplified version - you'll need to implement image fetching
      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageUrl // This should be base64 encoded image data
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parsing failed, returning raw text');
      }
      
      return {
        description: text,
        observations: [],
        abnormalities: [],
        probableConditions: [],
        recommendations: [],
        disclaimer: 'This is an AI-assisted analysis and must be reviewed by a qualified medical professional.',
        rawResponse: text
      };
    } catch (error) {
      console.error('Gemini image analysis error:', error);
      throw new Error(`Failed to analyze medical image: ${error.message}`);
    }
  }

  /**
   * AI Chatbot for patient questions
   * @param {string} question - Patient's question
   * @param {Object} context - Patient context (optional)
   * @returns {Promise<Object>} AI response with suggestions
   */
  async chatbotResponse(question, context = {}) {
    try {
      const prompt = `You are a medical AI assistant. Answer the patient's question clearly and concisely.

Question: ${question}

Provide practical health advice and suggest seeing a doctor if needed.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        response: response.text(),
        suggestions: []
      };
    } catch (error) {
      console.error('Gemini chatbot error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Generate patient summary for doctors
   * @param {Object} patientData - Complete patient data
   * @returns {Promise<string>} Comprehensive summary
   */
  async generatePatientSummary(patientData) {
    try {
      const { 
        personalInfo, 
        medicalHistory, 
        currentComplaints, 
        recentReports, 
        medications,
        appointments 
      } = patientData;
      
      const prompt = `You are an expert medical AI creating a concise patient summary for a doctor.

Patient Information:
- Name: ${personalInfo?.name}
- Age: ${personalInfo?.age}
- Gender: ${personalInfo?.gender}

Current Complaints: ${currentComplaints || 'None'}

${medicalHistory ? `Medical History: ${medicalHistory}` : ''}
${medications ? `Current Medications: ${medications}` : ''}
${recentReports ? `Recent Test Reports: ${recentReports}` : ''}
${appointments ? `Recent Appointments: ${appointments}` : ''}

Please provide a concise clinical summary highlighting:
1. Key medical history points
2. Current health status
3. Medications and compliance
4. Recent test results and trends
5. Areas requiring attention

Keep it professional and structured for quick doctor review.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini patient summary error:', error);
      throw new Error(`Failed to generate patient summary: ${error.message}`);
    }
  }

  /**
   * Analyze prescription for drug interactions and safety
   * @param {Object} prescriptionData - Prescription information
   * @returns {Promise<Object>} Safety analysis
   */
  async analyzePrescriptionSafety(prescriptionData) {
    try {
      const { medications, patientInfo, allergies, currentMedications } = prescriptionData;
      
      const prompt = `You are a pharmaceutical AI analyzing prescription safety.

New Medications to Prescribe:
${medications.map(med => `- ${med.name} ${med.dosage} ${med.frequency}`).join('\n')}

Patient Context:
- Age: ${patientInfo?.age}
- Known Allergies: ${allergies?.join(', ') || 'None'}
- Current Medications: ${currentMedications?.join(', ') || 'None'}

Analyze for:
1. Potential drug interactions
2. Allergy concerns
3. Dosage appropriateness
4. Contraindications
5. Safety warnings

Format as JSON with keys: safetyScore (0-100), interactions (array), warnings (array), recommendations (array), isSafe (boolean).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('JSON parsing failed, returning raw text');
      }
      
      return {
        safetyScore: 75,
        interactions: [],
        warnings: [],
        recommendations: [],
        isSafe: true,
        rawResponse: text
      };
    } catch (error) {
      console.error('Gemini prescription safety error:', error);
      throw new Error(`Failed to analyze prescription safety: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
