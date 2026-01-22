// Free translation service using basic translation mappings
// For production, you can replace with Google Translate API or LibreTranslate

const translations = {
  // English to Hindi
  'en-hi': {
    'hello': 'नमस्ते',
    'doctor': 'डॉक्टर',
    'patient': 'रोगी',
    'symptom': 'लक्षण',
    'medicine': 'दवा',
    'fever': 'बुखार',
    'headache': 'सिरदर्द',
    'cough': 'खांसी',
    'cold': 'जुकाम',
    'pain': 'दर्द',
    'yes': 'हां',
    'no': 'नहीं',
    'thank you': 'धन्यवाद',
    'please': 'कृपया',
    'good morning': 'सुप्रभात',
    'good evening': 'शुभ संध्या'
  },
  // English to Marathi
  'en-mr': {
    'hello': 'नमस्कार',
    'doctor': 'डॉक्टर',
    'patient': 'रुग्ण',
    'symptom': 'लक्षण',
    'medicine': 'औषध',
    'fever': 'ताप',
    'headache': 'डोकेदुखी',
    'cough': 'खोकला',
    'cold': 'सर्दी',
    'pain': 'वेदना',
    'yes': 'होय',
    'no': 'नाही',
    'thank you': 'धन्यवाद',
    'please': 'कृपया',
    'good morning': 'सुप्रभात',
    'good evening': 'शुभ संध्याकाळ'
  },
  // English to Gujarati
  'en-gu': {
    'hello': 'નમસ્તે',
    'doctor': 'ડૉક્ટર',
    'patient': 'દર્દી',
    'symptom': 'લક્ષણ',
    'medicine': 'દવા',
    'fever': 'તાવ',
    'headache': 'માથાનો દુખાવો',
    'cough': 'ઉધરસ',
    'cold': 'શરદી',
    'pain': 'પીડા',
    'yes': 'હા',
    'no': 'ના',
    'thank you': 'આભાર',
    'please': 'કૃપા કરીને',
    'good morning': 'સુપ્રભાત',
    'good evening': 'શુભ સંધ્યા'
  }
};

// Medical terms dictionary for better accuracy
const medicalTerms = {
  'en-hi': {
    'diabetes': 'मधुमेह',
    'blood pressure': 'रक्तचाप',
    'heart disease': 'हृदय रोग',
    'asthma': 'दमा',
    'allergy': 'एलर्जी',
    'infection': 'संक्रमण',
    'prescription': 'प्रिस्क्रिप्शन',
    'diagnosis': 'निदान',
    'treatment': 'उपचार',
    'consultation': 'परामर्श'
  },
  'en-mr': {
    'diabetes': 'मधुमेह',
    'blood pressure': 'रक्तदाब',
    'heart disease': 'हृदयरोग',
    'asthma': 'दमा',
    'allergy': 'ऍलर्जी',
    'infection': 'संसर्ग',
    'prescription': 'प्रिस्क्रिप्शन',
    'diagnosis': 'निदान',
    'treatment': 'उपचार',
    'consultation': 'सल्लामसलत'
  },
  'en-gu': {
    'diabetes': 'ડાયાબિટીસ',
    'blood pressure': 'બ્લડ પ્રેશર',
    'heart disease': 'હૃદય રોગ',
    'asthma': 'દમ',
    'allergy': 'એલર્જી',
    'infection': 'ચેપ',
    'prescription': 'પ્રિસ્ક્રિપ્શન',
    'diagnosis': 'નિદાન',
    'treatment': 'સારવાર',
    'consultation': 'સલાહ'
  }
};

class TranslationService {
  /**
   * Translate text from source to target language
   * @param {string} text - Text to translate
   * @param {string} from - Source language code (en, hi, mr, gu)
   * @param {string} to - Target language code (en, hi, mr, gu)
   * @returns {Promise<string>} - Translated text
   */
  async translate(text, from = 'en', to = 'en') {
    try {
      // If same language, return original text
      if (from === to) {
        return text;
      }

      // Convert to lowercase for matching
      const lowerText = text.toLowerCase().trim();
      
      // Try to find direct translation
      const translationKey = `${from}-${to}`;
      const dictionary = { ...translations[translationKey], ...medicalTerms[translationKey] };
      
      if (dictionary && dictionary[lowerText]) {
        return dictionary[lowerText];
      }

      // For reverse translation (Hindi/Marathi/Gujarati to English)
      if (to === 'en' && from !== 'en') {
        const reverseKey = `en-${from}`;
        const reverseDictionary = { ...translations[reverseKey], ...medicalTerms[reverseKey] };
        
        for (const [enWord, translatedWord] of Object.entries(reverseDictionary)) {
          if (translatedWord === text) {
            return enWord;
          }
        }
      }

      // Word-by-word translation for phrases
      const words = lowerText.split(' ');
      const translatedWords = words.map(word => {
        return dictionary?.[word] || word;
      });

      return translatedWords.join(' ');
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Get supported languages
   * @returns {Array} Array of language objects
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
    ];
  }

  /**
   * Detect language of text (simple detection)
   * @param {string} text - Text to detect language
   * @returns {string} Language code
   */
  detectLanguage(text) {
    // Simple detection based on character ranges
    const hindiRegex = /[\u0900-\u097F]/;
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    
    if (hindiRegex.test(text) && !gujaratiRegex.test(text)) {
      return 'hi'; // Could be Hindi or Marathi (both use Devanagari)
    }
    if (gujaratiRegex.test(text)) {
      return 'gu';
    }
    return 'en';
  }
}

module.exports = new TranslationService();
