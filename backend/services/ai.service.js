const OpenAI = require('openai');

class AIService {
  constructor() {
    // Try OpenAI first, fallback to Gemini
    if (process.env.OPENAI_API_KEY) {
      this.provider = 'openai';
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else if (process.env.GEMINI_API_KEY) {
      this.provider = 'gemini';
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } else {
      throw new Error('No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY');
    }
  }

  /**
   * AI Chatbot for patient questions
   * @param {string} question - Patient's question
   * @param {Object} context - Patient context (optional)
   * @param {Array} files - Uploaded files (optional)
   * @returns {Promise<Object>} AI response with suggestions
   */
  async chatbotResponse(question, context = {}, files = []) {
    try {
      if (this.provider === 'openai') {
        // Prepare messages for OpenAI
        const messages = [
          {
            role: "system",
            content: "You are a helpful medical AI assistant. Provide clear, concise health advice. When analyzing images, describe what you see and provide relevant medical guidance. Always suggest seeing a doctor for serious concerns. However, if the patient explicitly states they cannot access a doctor, provide practical home care advice and remedies while still emphasizing the importance of seeking professional care when possible."
          }
        ];

        // Add conversation history if available
        if (context.conversationHistory && context.conversationHistory.length > 0) {
          // Add previous messages (excluding the current one)
          const historyMessages = context.conversationHistory.slice(0, -1);
          for (const historyMsg of historyMessages) {
            messages.push({
              role: historyMsg.role,
              content: historyMsg.content
            });
          }
        }

        // Add the current user message
        if (files && files.length > 0) {
          const imageFiles = files.filter(f => f.mimetype.startsWith('image/'));
          
          if (imageFiles.length > 0) {
            // Build content array with text and images
            const content = [];
            
            if (question) {
              content.push({
                type: "text",
                text: question
              });
            }

            // Add images as base64
            for (const file of imageFiles) {
              const base64Image = file.buffer.toString('base64');
              content.push({
                type: "image_url",
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`
                }
              });
            }

            messages.push({
              role: "user",
              content: content
            });
          } else {
            // No images, just text
            messages.push({
              role: "user",
              content: question
            });
          }
        } else {
          // No files, just text
          messages.push({
            role: "user",
            content: question
          });
        }

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        });

        return {
          response: completion.choices[0].message.content,
          suggestions: []
        };
      } else {
        // Gemini fallback
        if (files && files.length > 0) {
          const imageFiles = files.filter(f => f.mimetype.startsWith('image/'));
          
          if (imageFiles.length > 0) {
            // Gemini Pro Vision
            const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            
            const imageParts = imageFiles.map(file => ({
              inlineData: {
                data: file.buffer.toString('base64'),
                mimeType: file.mimetype
              }
            }));

            // Include conversation history in prompt
            let prompt = `You are a medical AI assistant. `;
            
            if (context.conversationHistory && context.conversationHistory.length > 1) {
              prompt += `Previous conversation:\n`;
              const historyMessages = context.conversationHistory.slice(0, -1);
              historyMessages.forEach(msg => {
                prompt += `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}\n`;
              });
              prompt += `\n`;
            }
            
            prompt += `Analyze the provided medical image(s) and answer the patient's question.

Question: ${question || 'Please analyze this medical image and provide insights.'}

Provide clear medical guidance. If the patient cannot access a doctor, provide practical home care advice while emphasizing professional care when possible.`;

            const result = await visionModel.generateContent([prompt, ...imageParts]);
            const response = await result.response;
            
            return {
              response: response.text(),
              suggestions: []
            };
          }
        }

        // No images, use regular text model with conversation history
        let prompt = `You are a medical AI assistant. `;
        
        if (context.conversationHistory && context.conversationHistory.length > 1) {
          prompt += `Previous conversation:\n`;
          const historyMessages = context.conversationHistory.slice(0, -1);
          historyMessages.forEach(msg => {
            prompt += `${msg.role === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}\n`;
          });
          prompt += `\n`;
        }
        
        prompt += `Answer the patient's question clearly and concisely.

Question: ${question}

Provide practical health advice. If the patient cannot access a doctor, provide home care suggestions while emphasizing professional care when possible.`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        return {
          response: response.text(),
          suggestions: []
        };
      }
    } catch (error) {
      console.error('AI chatbot error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Analyze patient symptoms
   */
  async analyzeSymptomsForDiagnosis(patientData) {
    try {
      const { symptoms, chiefComplaints, duration, vitalSigns } = patientData;
      
      const prompt = `Analyze these symptoms and provide medical insights:
- Chief Complaints: ${chiefComplaints}
- Symptoms: ${symptoms?.join(', ') || 'Not specified'}
- Duration: ${duration || 'Not specified'}

Provide:
1. Probable diagnoses
2. Recommended actions
3. Warning signs to watch`;

      if (this.provider === 'openai') {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
          max_tokens: 800
        });

        return {
          summary: completion.choices[0].message.content,
          probableDiagnoses: [],
          recommendations: [],
          warningFlags: []
        };
      } else {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        return {
          summary: response.text(),
          probableDiagnoses: [],
          recommendations: [],
          warningFlags: []
        };
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      throw new Error(`Failed to analyze symptoms: ${error.message}`);
    }
  }

  /**
   * Analyze medical report for doctors
   * @param {Object} reportData - Medical report details
   * @returns {Promise<string>} AI summary with diagnosis and treatment suggestions
   */
  async analyzeReportForDoctor(reportData) {
    try {
      const { patientName, patientAge, patientGender, reportType, reportName, findings, vitalSigns } = reportData;

      const prompt = `You are an expert medical AI assistant helping a doctor review a patient's medical report. Provide a comprehensive clinical analysis.

**Patient Information:**
- Name: ${patientName}
- Age: ${patientAge} years
- Gender: ${patientGender}

**Report Details:**
- Type: ${reportType}
- Test Name: ${reportName}

**Vital Signs:**
- Temperature: ${vitalSigns.temperature}
- Blood Pressure: ${vitalSigns.bloodPressure}
- Pulse Rate: ${vitalSigns.pulseRate}
- Oxygen Saturation: ${vitalSigns.oxygenLevel}

**Findings:**
${findings}

Please provide a structured analysis including:

1. **Clinical Summary**: Brief overview of the key findings
2. **Potential Diagnoses**: List possible conditions based on the report findings and vitals
3. **Recommended Treatment**: Suggest appropriate treatment options or medications
4. **Additional Tests**: If needed, recommend further diagnostic tests
5. **Urgency Level**: Indicate if immediate intervention is required
6. **Follow-up**: Suggest follow-up timeline

Format the response in a clear, professional medical tone suitable for a doctor's review.`;

      if (this.provider === 'openai') {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert medical AI assistant providing clinical analysis to healthcare professionals. Be precise, evidence-based, and structured in your responses."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent medical analysis
          max_tokens: 1500
        });

        return completion.choices[0].message.content;
      } else {
        // Gemini fallback
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
    } catch (error) {
      console.error('Report analysis error:', error);
      throw new Error(`Failed to analyze report: ${error.message}`);
    }
  }

  async generatePatientSummary(patientData) {
    try {
      const { name, age, gender, symptoms, vitalSigns, notes, medicalHistory } = patientData;

      const prompt = `As a medical AI assistant, analyze this patient case and provide a comprehensive summary for the consulting doctor.

**Patient Information:**
- Name: ${name}
- Age: ${age} years
- Gender: ${gender}

**Chief Complaint:**
${symptoms}

**Vital Signs:**
- Temperature: ${vitalSigns?.temperature || 'Not recorded'}
- Blood Pressure: ${vitalSigns?.bloodPressure || 'Not recorded'}
- Pulse Rate: ${vitalSigns?.pulseRate || 'Not recorded'}
- Oxygen Saturation: ${vitalSigns?.oxygenLevel || 'Not recorded'}

**Additional Notes:**
${notes || 'None'}

**Medical History:**
${medicalHistory}

Please provide:

1. **Patient Overview**: A brief clinical summary (2-3 sentences)
2. **Possible Diagnosis**: Based on symptoms and vitals, what are the likely conditions? Be specific but mention it's preliminary.
3. **Treatment Recommendations**: Suggest appropriate medications, dosages, and lifestyle modifications
4. **Urgency Level**: Classify as HIGH, MEDIUM, or LOW
5. **Red Flags**: Any concerning symptoms that require immediate attention

Format your response as a structured analysis suitable for clinical decision-making.`;

      if (this.provider === 'openai') {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert medical AI providing clinical decision support to doctors. Be thorough, evidence-based, and highlight important clinical considerations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1200
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Parse the response into structured format
        return this.parsePatientSummary(aiResponse);
      } else {
        // Gemini fallback
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.parsePatientSummary(response.text());
      }
    } catch (error) {
      console.error('Patient summary error:', error);
      throw new Error(`Failed to generate patient summary: ${error.message}`);
    }
  }

  parsePatientSummary(text) {
    // Simple parsing to extract key sections
    const sections = {
      overview: '',
      possibleDiagnosis: '',
      recommendations: '',
      urgency: 'MEDIUM',
      redFlags: ''
    };

    // Extract sections using regex patterns
    const overviewMatch = text.match(/\*\*Patient Overview\*\*:?\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
    const diagnosisMatch = text.match(/\*\*Possible Diagnosis\*\*:?\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
    const recommendationsMatch = text.match(/\*\*Treatment Recommendations\*\*:?\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);
    const urgencyMatch = text.match(/\*\*Urgency Level\*\*:?\s*(HIGH|MEDIUM|LOW)/i);
    const redFlagsMatch = text.match(/\*\*Red Flags\*\*:?\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i);

    if (overviewMatch) sections.overview = overviewMatch[1].trim();
    if (diagnosisMatch) sections.possibleDiagnosis = diagnosisMatch[1].trim();
    if (recommendationsMatch) sections.recommendations = recommendationsMatch[1].trim();
    if (urgencyMatch) sections.urgency = urgencyMatch[1].toUpperCase();
    if (redFlagsMatch) sections.redFlags = redFlagsMatch[1].trim();

    // Fallback if parsing fails - return the whole text split reasonably
    if (!sections.overview && !sections.possibleDiagnosis) {
      const lines = text.split('\n').filter(l => l.trim());
      sections.overview = lines.slice(0, 3).join(' ');
      sections.possibleDiagnosis = lines.slice(3, 6).join(' ');
      sections.recommendations = lines.slice(6).join(' ');
    }

    return sections;
  }
}

module.exports = new AIService();
