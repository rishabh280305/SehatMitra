const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Essential Medicines List from AAM SHC EML.pdf
// Comprehensive Essential Medicines List for Sub Health Centers - FREE medicines
const ESSENTIAL_MEDICINES = [
  // Analgesics, Antipyretics
  { id: 'em001', name: 'Paracetamol', strength: '500mg', form: 'Tablet', category: 'Analgesic/Antipyretic', usage: 'Fever, mild to moderate pain', dosage: 'Adults: 500-1000mg every 4-6 hours. Max 4g/day', free: true },
  { id: 'em002', name: 'Paracetamol', strength: '125mg/5ml', form: 'Syrup', category: 'Analgesic/Antipyretic', usage: 'Fever and pain in children', dosage: 'Children: 10-15mg/kg every 4-6 hours', free: true },
  { id: 'em003', name: 'Ibuprofen', strength: '400mg', form: 'Tablet', category: 'NSAID', usage: 'Pain, inflammation, fever', dosage: 'Adults: 400mg every 6-8 hours', free: true },
  { id: 'em004', name: 'Diclofenac Sodium', strength: '50mg', form: 'Tablet', category: 'NSAID', usage: 'Pain, inflammation', dosage: 'Adults: 50mg 2-3 times daily', free: true },

  // Antibiotics
  { id: 'em005', name: 'Amoxicillin', strength: '250mg', form: 'Capsule', category: 'Antibiotic', usage: 'Respiratory infections, UTI, skin infections', dosage: 'Adults: 250-500mg every 8 hours', free: true },
  { id: 'em006', name: 'Amoxicillin', strength: '125mg/5ml', form: 'Syrup', category: 'Antibiotic', usage: 'Bacterial infections in children', dosage: 'Children: 20-40mg/kg/day in 3 divided doses', free: true },
  { id: 'em007', name: 'Azithromycin', strength: '500mg', form: 'Tablet', category: 'Antibiotic', usage: 'Respiratory tract infections, STIs', dosage: '500mg once daily for 3 days', free: true },
  { id: 'em008', name: 'Ciprofloxacin', strength: '500mg', form: 'Tablet', category: 'Antibiotic', usage: 'UTI, diarrhea, respiratory infections', dosage: '500mg twice daily for 5-7 days', free: true },
  { id: 'em009', name: 'Metronidazole', strength: '400mg', form: 'Tablet', category: 'Antibiotic/Antiprotozoal', usage: 'Anaerobic infections, amoebiasis, giardiasis', dosage: '400mg three times daily for 7-10 days', free: true },
  { id: 'em010', name: 'Cotrimoxazole', strength: '480mg', form: 'Tablet', category: 'Antibiotic', usage: 'UTI, respiratory infections', dosage: '2 tablets twice daily', free: true },
  { id: 'em011', name: 'Doxycycline', strength: '100mg', form: 'Capsule', category: 'Antibiotic', usage: 'Respiratory, skin infections, malaria prophylaxis', dosage: '100mg twice daily', free: true },
  { id: 'em012', name: 'Cephalexin', strength: '500mg', form: 'Capsule', category: 'Antibiotic', usage: 'Skin and soft tissue infections', dosage: '500mg every 6 hours', free: true },

  // Antimalarials
  { id: 'em013', name: 'Chloroquine', strength: '250mg', form: 'Tablet', category: 'Antimalarial', usage: 'Malaria treatment and prophylaxis', dosage: 'As per weight-based protocol', free: true },
  { id: 'em014', name: 'Artemether + Lumefantrine', strength: '20mg + 120mg', form: 'Tablet', category: 'Antimalarial', usage: 'Falciparum malaria', dosage: 'Weight-based dosing over 3 days', free: true },
  { id: 'em015', name: 'Primaquine', strength: '7.5mg', form: 'Tablet', category: 'Antimalarial', usage: 'Radical cure of vivax malaria', dosage: '0.25mg/kg daily for 14 days', free: true },

  // Anthelmintics
  { id: 'em016', name: 'Albendazole', strength: '400mg', form: 'Tablet', category: 'Anthelmintic', usage: 'Worm infestations', dosage: 'Single dose 400mg', free: true },
  { id: 'em017', name: 'Mebendazole', strength: '100mg', form: 'Tablet', category: 'Anthelmintic', usage: 'Worm infestations', dosage: '100mg twice daily for 3 days', free: true },

  // Antihistamines
  { id: 'em018', name: 'Cetirizine', strength: '10mg', form: 'Tablet', category: 'Antihistamine', usage: 'Allergies, urticaria, rhinitis', dosage: '10mg once daily', free: true },
  { id: 'em019', name: 'Chlorpheniramine', strength: '4mg', form: 'Tablet', category: 'Antihistamine', usage: 'Allergic conditions', dosage: '4mg every 4-6 hours', free: true },
  { id: 'em020', name: 'Promethazine', strength: '25mg', form: 'Tablet', category: 'Antihistamine', usage: 'Allergies, motion sickness, sedation', dosage: '25mg at bedtime', free: true },

  // Antacids and Antiulcer
  { id: 'em021', name: 'Omeprazole', strength: '20mg', form: 'Capsule', category: 'Proton Pump Inhibitor', usage: 'Gastric ulcer, GERD, hyperacidity', dosage: '20mg once daily before breakfast', free: true },
  { id: 'em022', name: 'Ranitidine', strength: '150mg', form: 'Tablet', category: 'H2 Blocker', usage: 'Peptic ulcer, hyperacidity', dosage: '150mg twice daily', free: true },
  { id: 'em023', name: 'Antacid Gel', strength: 'Al(OH)3 + Mg(OH)2', form: 'Suspension', category: 'Antacid', usage: 'Acidity, heartburn', dosage: '10-20ml after meals', free: true },
  { id: 'em024', name: 'Domperidone', strength: '10mg', form: 'Tablet', category: 'Antiemetic', usage: 'Nausea, vomiting', dosage: '10mg three times daily before meals', free: true },

  // ORS and Zinc
  { id: 'em025', name: 'ORS', strength: 'WHO Formula', form: 'Powder', category: 'Rehydration', usage: 'Diarrhea, dehydration', dosage: 'Dissolve in 1L water, sip frequently', free: true },
  { id: 'em026', name: 'Zinc Sulphate', strength: '20mg', form: 'Dispersible Tablet', category: 'Supplement', usage: 'Diarrhea in children', dosage: 'Children >6m: 20mg daily for 14 days', free: true },

  // Respiratory
  { id: 'em027', name: 'Salbutamol', strength: '4mg', form: 'Tablet', category: 'Bronchodilator', usage: 'Asthma, COPD, bronchospasm', dosage: '2-4mg 3-4 times daily', free: true },
  { id: 'em028', name: 'Salbutamol', strength: '100mcg', form: 'Inhaler', category: 'Bronchodilator', usage: 'Acute asthma, bronchospasm', dosage: '1-2 puffs every 4-6 hours as needed', free: true },
  { id: 'em029', name: 'Theophylline', strength: '100mg', form: 'Tablet', category: 'Bronchodilator', usage: 'Asthma, COPD', dosage: '100-300mg twice daily', free: true },
  { id: 'em030', name: 'Cough Syrup', strength: 'Dextromethorphan', form: 'Syrup', category: 'Antitussive', usage: 'Dry cough', dosage: '10ml every 6-8 hours', free: true },

  // Antidiabetics
  { id: 'em031', name: 'Metformin', strength: '500mg', form: 'Tablet', category: 'Antidiabetic', usage: 'Type 2 Diabetes Mellitus', dosage: '500mg twice daily with meals', free: true },
  { id: 'em032', name: 'Glibenclamide', strength: '5mg', form: 'Tablet', category: 'Antidiabetic', usage: 'Type 2 Diabetes Mellitus', dosage: '2.5-5mg once daily', free: true },

  // Antihypertensives
  { id: 'em033', name: 'Amlodipine', strength: '5mg', form: 'Tablet', category: 'Calcium Channel Blocker', usage: 'Hypertension, angina', dosage: '5-10mg once daily', free: true },
  { id: 'em034', name: 'Atenolol', strength: '50mg', form: 'Tablet', category: 'Beta Blocker', usage: 'Hypertension, angina', dosage: '50-100mg once daily', free: true },
  { id: 'em035', name: 'Enalapril', strength: '5mg', form: 'Tablet', category: 'ACE Inhibitor', usage: 'Hypertension, heart failure', dosage: '5-20mg daily', free: true },
  { id: 'em036', name: 'Losartan', strength: '50mg', form: 'Tablet', category: 'ARB', usage: 'Hypertension', dosage: '50-100mg once daily', free: true },
  { id: 'em037', name: 'Hydrochlorothiazide', strength: '25mg', form: 'Tablet', category: 'Diuretic', usage: 'Hypertension, edema', dosage: '12.5-25mg once daily', free: true },

  // Iron and Vitamins
  { id: 'em038', name: 'Ferrous Sulphate', strength: '200mg', form: 'Tablet', category: 'Iron Supplement', usage: 'Iron deficiency anemia', dosage: '200mg 1-3 times daily', free: true },
  { id: 'em039', name: 'Folic Acid', strength: '5mg', form: 'Tablet', category: 'Vitamin', usage: 'Anemia, pregnancy', dosage: '5mg once daily', free: true },
  { id: 'em040', name: 'IFA Tablet', strength: 'Iron 100mg + Folic Acid 0.5mg', form: 'Tablet', category: 'Supplement', usage: 'Anemia in pregnancy', dosage: '1 tablet daily', free: true },
  { id: 'em041', name: 'Vitamin B Complex', strength: 'Mixed', form: 'Tablet', category: 'Vitamin', usage: 'Vitamin B deficiency', dosage: '1 tablet daily', free: true },
  { id: 'em042', name: 'Calcium Carbonate', strength: '500mg', form: 'Tablet', category: 'Calcium Supplement', usage: 'Calcium deficiency, pregnancy', dosage: '500mg 1-2 times daily', free: true },
  { id: 'em043', name: 'Vitamin D3', strength: '60000 IU', form: 'Sachets', category: 'Vitamin', usage: 'Vitamin D deficiency', dosage: '1 sachet weekly for 8 weeks', free: true },

  // Eye and Ear
  { id: 'em044', name: 'Ciprofloxacin', strength: '0.3%', form: 'Eye Drops', category: 'Ophthalmic Antibiotic', usage: 'Bacterial conjunctivitis', dosage: '1-2 drops every 4-6 hours', free: true },
  { id: 'em045', name: 'Chloramphenicol', strength: '1%', form: 'Eye Ointment', category: 'Ophthalmic Antibiotic', usage: 'Eye infections', dosage: 'Apply 2-3 times daily', free: true },
  { id: 'em046', name: 'Gentamicin', strength: '0.3%', form: 'Ear Drops', category: 'Otic Antibiotic', usage: 'Ear infections', dosage: '2-3 drops 3 times daily', free: true },

  // Skin Preparations
  { id: 'em047', name: 'Povidone Iodine', strength: '5%', form: 'Solution', category: 'Antiseptic', usage: 'Wound cleaning, disinfection', dosage: 'Apply to affected area', free: true },
  { id: 'em048', name: 'Calamine Lotion', strength: 'Standard', form: 'Lotion', category: 'Skin Protectant', usage: 'Itching, skin irritation', dosage: 'Apply as needed', free: true },
  { id: 'em049', name: 'Clotrimazole', strength: '1%', form: 'Cream', category: 'Antifungal', usage: 'Fungal skin infections', dosage: 'Apply twice daily for 2-4 weeks', free: true },
  { id: 'em050', name: 'Permethrin', strength: '5%', form: 'Cream', category: 'Antiparasitic', usage: 'Scabies', dosage: 'Apply from neck down, wash after 8-14 hours', free: true },
  { id: 'em051', name: 'Silver Sulfadiazine', strength: '1%', form: 'Cream', category: 'Topical Antibiotic', usage: 'Burns, wound infections', dosage: 'Apply 1-2 times daily', free: true },
  { id: 'em052', name: 'Hydrocortisone', strength: '1%', form: 'Cream', category: 'Topical Corticosteroid', usage: 'Eczema, dermatitis', dosage: 'Apply thin layer 1-2 times daily', free: true },

  // Emergency Medicines
  { id: 'em053', name: 'Adrenaline', strength: '1mg/ml', form: 'Injection', category: 'Emergency', usage: 'Anaphylaxis, cardiac arrest', dosage: '0.5mg IM for anaphylaxis', free: true },
  { id: 'em054', name: 'Atropine', strength: '0.6mg/ml', form: 'Injection', category: 'Anticholinergic', usage: 'Bradycardia, organophosphate poisoning', dosage: 'As per protocol', free: true },
  { id: 'em055', name: 'Hydrocortisone', strength: '100mg', form: 'Injection', category: 'Corticosteroid', usage: 'Severe allergies, asthma', dosage: '100-500mg IV/IM', free: true },
  { id: 'em056', name: 'Dextrose', strength: '25%', form: 'Injection', category: 'Emergency', usage: 'Hypoglycemia', dosage: '25-50ml IV', free: true },

  // IV Fluids
  { id: 'em057', name: 'Normal Saline', strength: '0.9%', form: 'IV Fluid', category: 'IV Fluid', usage: 'Dehydration, fluid replacement', dosage: 'As per clinical need', free: true },
  { id: 'em058', name: 'Ringer Lactate', strength: 'Standard', form: 'IV Fluid', category: 'IV Fluid', usage: 'Fluid and electrolyte replacement', dosage: 'As per clinical need', free: true },
  { id: 'em059', name: 'Dextrose', strength: '5%', form: 'IV Fluid', category: 'IV Fluid', usage: 'Calorie supplement, hypoglycemia', dosage: 'As per clinical need', free: true },

  // Contraceptives and Maternal Health
  { id: 'em060', name: 'Misoprostol', strength: '200mcg', form: 'Tablet', category: 'Uterotonic', usage: 'PPH prevention and treatment', dosage: '600mcg sublingual', free: true },
  { id: 'em061', name: 'Oxytocin', strength: '10 IU', form: 'Injection', category: 'Uterotonic', usage: 'PPH, labor induction', dosage: 'As per protocol', free: true },
  { id: 'em062', name: 'Levonorgestrel', strength: '1.5mg', form: 'Tablet', category: 'Emergency Contraceptive', usage: 'Emergency contraception', dosage: 'Single dose within 72 hours', free: true },

  // Others
  { id: 'em063', name: 'Tetanus Toxoid', strength: '0.5ml', form: 'Injection', category: 'Vaccine', usage: 'Tetanus prevention', dosage: '0.5ml IM', free: true },
  { id: 'em064', name: 'Anti-Rabies Vaccine', strength: 'Standard', form: 'Injection', category: 'Vaccine', usage: 'Post-exposure prophylaxis', dosage: 'As per protocol (0,3,7,14,28 days)', free: true },
  { id: 'em065', name: 'Activated Charcoal', strength: 'Powder', form: 'Powder', category: 'Antidote', usage: 'Poisoning', dosage: '1g/kg mixed with water', free: true },
  { id: 'em066', name: 'Lignocaine', strength: '2%', form: 'Injection', category: 'Local Anesthetic', usage: 'Local anesthesia', dosage: 'As per procedure', free: true },
];

// Symptom to medicine mapping for intelligent suggestions
const SYMPTOM_MEDICINE_MAP = {
  'fever': ['em001', 'em002', 'em003'],
  'pain': ['em001', 'em003', 'em004'],
  'headache': ['em001', 'em003'],
  'body ache': ['em001', 'em003', 'em004'],
  'joint pain': ['em003', 'em004'],
  'cold': ['em018', 'em019', 'em001', 'em030'],
  'cough': ['em030', 'em027', 'em029'],
  'flu': ['em001', 'em018', 'em030'],
  'allergy': ['em018', 'em019', 'em020'],
  'skin allergy': ['em018', 'em048', 'em052'],
  'itching': ['em018', 'em048', 'em019'],
  'infection': ['em005', 'em006', 'em007', 'em008'],
  'throat infection': ['em005', 'em007', 'em001'],
  'ear infection': ['em046', 'em005'],
  'eye infection': ['em044', 'em045'],
  'uti': ['em008', 'em010', 'em005'],
  'urinary infection': ['em008', 'em010'],
  'diarrhea': ['em025', 'em026', 'em009'],
  'loose motion': ['em025', 'em026', 'em009'],
  'vomiting': ['em024', 'em025'],
  'nausea': ['em024', 'em020'],
  'acidity': ['em021', 'em022', 'em023'],
  'gastric': ['em021', 'em022', 'em023'],
  'stomach pain': ['em021', 'em024', 'em001'],
  'malaria': ['em013', 'em014', 'em015'],
  'worms': ['em016', 'em017'],
  'asthma': ['em027', 'em028', 'em029'],
  'breathing difficulty': ['em027', 'em028'],
  'diabetes': ['em031', 'em032'],
  'blood pressure': ['em033', 'em034', 'em035', 'em036'],
  'hypertension': ['em033', 'em034', 'em035', 'em036'],
  'anemia': ['em038', 'em039', 'em040', 'em041'],
  'weakness': ['em038', 'em041', 'em042'],
  'wound': ['em047', 'em051', 'em066'],
  'burn': ['em051', 'em047'],
  'fungal infection': ['em049'],
  'ringworm': ['em049'],
  'scabies': ['em050'],
  'eczema': ['em052', 'em048'],
  'pregnancy': ['em039', 'em040', 'em042'],
  'dehydration': ['em025', 'em057', 'em058'],
};

// Search medicines (no auth required for search)
router.get('/search', async (req, res) => {
  try {
    const { query, category, medicine } = req.query;
    const searchTerm = (query || medicine || '').toLowerCase();
    let results = ESSENTIAL_MEDICINES;
    
    if (searchTerm) {
      results = results.filter(med => 
        med.name.toLowerCase().includes(searchTerm) ||
        med.category.toLowerCase().includes(searchTerm) ||
        med.usage.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category) {
      results = results.filter(med => med.category.toLowerCase() === category.toLowerCase());
    }
    
    res.json({
      success: true,
      count: results.length,
      medicines: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching medicines' });
  }
});

// Get all medicines
router.get('/all', (req, res) => {
  res.json({
    success: true,
    count: ESSENTIAL_MEDICINES.length,
    medicines: ESSENTIAL_MEDICINES
  });
});

// Get suggestions based on symptoms (main feature for doctors)
router.post('/suggest', (req, res) => {
  try {
    const { symptoms, diagnosis } = req.body;
    const suggestions = [];
    const addedIds = new Set();
    
    // Combine symptoms and diagnosis for matching
    const searchText = `${symptoms || ''} ${diagnosis || ''}`.toLowerCase();
    
    // Find matching medicines from symptom map
    for (const [symptom, medicineIds] of Object.entries(SYMPTOM_MEDICINE_MAP)) {
      if (searchText.includes(symptom)) {
        medicineIds.forEach(id => {
          if (!addedIds.has(id)) {
            const medicine = ESSENTIAL_MEDICINES.find(m => m.id === id);
            if (medicine) {
              suggestions.push({
                ...medicine,
                matchedSymptom: symptom,
                relevanceScore: symptom.length / searchText.length
              });
              addedIds.add(id);
            }
          }
        });
      }
    }
    
    // Sort by relevance
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit to top 10 suggestions
    const topSuggestions = suggestions.slice(0, 10);
    
    res.json({
      success: true,
      message: topSuggestions.length > 0 
        ? 'Free medicine suggestions based on symptoms' 
        : 'No specific matches found. Showing common medicines.',
      suggestions: topSuggestions.length > 0 ? topSuggestions : ESSENTIAL_MEDICINES.slice(0, 5),
      note: 'These medicines are available FREE at government Sub Health Centers'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating suggestions' });
  }
});

// Get categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(ESSENTIAL_MEDICINES.map(m => m.category))];
  res.json({
    success: true,
    categories
  });
});

module.exports = router;
