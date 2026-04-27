"use client";

import React, { createContext, useContext, useState } from 'react';

export type Language = 'English' | 'Hindi' | 'Bengali';

interface Translations {
  // Header
  poweredBy: string;
  title: string;
  subtitle: string;
  // Form
  patientDetails: string;
  fullName: string;
  fullNamePlaceholder: string;
  age: string;
  agePlaceholder: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  city: string;
  cityPlaceholder: string;
  whatsapp: string;
  whatsappPlaceholder: string;
  dropFile: string;
  dropFileHint: string;
  clickToChange: string;
  runAnalysis: string;
  analyzing: string;
  fillRequired: string;
  // Agent Panel
  readyToAnalyze: string;
  readyHint: string;
  thinkingTitle: string;
  geminiReading: string;
  processing: string;
  done: string;
  failed: string;
  waiting: string;
  // Steps
  stepRead: string;
  stepAnalyze: string;
  stepEmergency: string;
  stepClinics: string;
  stepReport: string;
  // Emergency
  emergencyTitle: string;
  emergencyDefault: string;
  callAmbulance: string;
  // Tabs
  tabOverview: string;
  tabReport: string;
  tabImages: string;
  tabCost: string;
  tabClinics: string;
  tabWhatsApp: string;
  // Language picker
  selectLanguage: string;
  analysisComplete: string;
  analysisFailed: string;
  // Overview Tab
  healthScore: string;
  outOf10: string;
  urgencyLevel: string;
  seeSpecialist: string;
  imagingScan: string;
  executiveSummary: string;
  keyFindings: string;
  conditionsDetected: string;
  goToERIf: string;
  callFreeAmbulance: string;
  // Report Tab
  fullMedicalReport: string;
  download: string;
  actionPlan: string;
  doToday: string;
  thisWeek: string;
  thisMonth: string;
  doctorVisitGuide: string;
  see: string;
  bringToAppointment: string;
  questionsToAsk: string;
  // Cost Tab
  medicalCostEstimator: string;
  indiaSpecific: string;
  estimatedTotalCost: string;
  basedOn: string;
  costBreakdown: string;
  monthlyOngoingCost: string;
  perMonth: string;
  consultations: string;
  diagnosticTests: string;
  medicines: string;
  proceduresSurgeries: string;
  moneySavingTips: string;
  insuranceGovSchemes: string;
  noConsultations: string;
  noTests: string;
  noMedicines: string;
  noProcedures: string;
  costNotAvailable: string;
  duration: string;
  items: string;
  item: string;
  // Chat
  askAI: string;
  askAITitle: string;
  askAISubtitle: string;
  askPlaceholder: string;
  askSend: string;
  askThinking: string;
  askDisclaimer: string;
  askSuggestion1: string;
  askSuggestion2: string;
  askSuggestion3: string;
}

const en: Translations = {
  poweredBy: 'Gemini Vision Powered',
  title: 'HealthScan',
  subtitle: 'Upload any medical report — blood tests, MRI, CT, X-ray, prescriptions. Gemini reads, analyzes, and guides your next steps.',
  patientDetails: 'Patient Details',
  fullName: 'Full Name *',
  fullNamePlaceholder: 'e.g. Rahul Sharma',
  age: 'Age',
  agePlaceholder: '30',
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  city: 'City *',
  cityPlaceholder: 'e.g. Mumbai',
  whatsapp: 'WhatsApp Number(s)',
  whatsappPlaceholder: '+91... (comma separated)',
  dropFile: 'Drop medical file here',
  dropFileHint: 'Images (JPG, PNG) or PDF — Blood reports, MRI, CT, X-Ray, Prescriptions',
  clickToChange: 'Click to change',
  runAnalysis: 'Run Deep Analysis',
  analyzing: 'Analyzing...',
  fillRequired: 'Please fill in Name, City, and upload a file.',
  readyToAnalyze: 'Ready to Analyze',
  readyHint: 'Fill in patient details, upload a medical document, and click Run Deep Analysis.',
  thinkingTitle: 'Gemini Agent — Thinking Process',
  geminiReading: 'Gemini Vision is reading and analyzing your medical document...',
  processing: 'Processing...',
  done: '✓ Done',
  failed: '✗ Failed',
  waiting: 'Waiting',
  stepRead: 'Reading your medical document',
  stepAnalyze: 'Analyzing all findings',
  stepEmergency: 'Checking for critical values',
  stepClinics: 'Finding nearby clinics',
  stepReport: 'Generating your complete report',
  emergencyTitle: 'Critical Emergency Detected',
  emergencyDefault: 'Seek immediate medical attention',
  callAmbulance: 'CALL 108',
  tabOverview: 'Overview',
  tabReport: 'Full Report',
  tabImages: 'Images',
  tabCost: 'Cost Estimate',
  tabClinics: 'Clinics',
  tabWhatsApp: 'WhatsApp',
  selectLanguage: 'Language',
  analysisComplete: 'Analysis complete!',
  analysisFailed: 'Analysis failed',
  // Overview Tab
  healthScore: 'Health Score',
  outOf10: 'out of 10',
  urgencyLevel: 'Urgency Level',
  seeSpecialist: 'See:',
  imagingScan: 'Imaging Scan',
  executiveSummary: 'Executive Summary',
  keyFindings: 'Key Findings',
  conditionsDetected: 'Conditions Detected',
  goToERIf: '🚨 Go to Emergency Immediately If:',
  callFreeAmbulance: 'Call 108 for free ambulance',
  // Report Tab
  fullMedicalReport: 'Full Medical Report',
  download: 'Download',
  actionPlan: 'Action Plan',
  doToday: 'DO TODAY',
  thisWeek: 'THIS WEEK',
  thisMonth: 'THIS MONTH',
  doctorVisitGuide: '👨‍⚕️ Doctor Visit Guide',
  see: 'See:',
  bringToAppointment: 'Bring to appointment:',
  questionsToAsk: 'Questions to ask:',
  // Cost Tab
  medicalCostEstimator: 'Medical Cost Estimator',
  indiaSpecific: 'India Specific',
  estimatedTotalCost: 'Estimated Total Treatment Cost',
  basedOn: 'Based on:',
  costBreakdown: 'Cost Breakdown',
  monthlyOngoingCost: 'Monthly Ongoing Cost',
  perMonth: '/month',
  consultations: 'Consultations',
  diagnosticTests: 'Diagnostic Tests & Scans',
  medicines: 'Medicines',
  proceduresSurgeries: 'Procedures / Surgeries',
  moneySavingTips: '💡 Money Saving Tips',
  insuranceGovSchemes: '🛡️ Insurance & Government Schemes',
  noConsultations: 'No consultations listed.',
  noTests: 'No tests listed.',
  noMedicines: 'No medicines listed.',
  noProcedures: 'No procedures listed.',
  costNotAvailable: 'Cost estimate not available. Re-run analysis to generate.',
  duration: 'Duration:',
  items: 'items',
  item: 'item',
  // Chat
  askAI: 'Ask AI',
  askAITitle: 'Ask HealthScan AI',
  askAISubtitle: 'Ask anything about your report',
  askPlaceholder: 'e.g. Is my hemoglobin level dangerous?',
  askSend: 'Send',
  askThinking: 'Thinking...',
  askDisclaimer: 'AI answers are based on your report only. Always consult a doctor.',
  askSuggestion1: 'What does my health score mean?',
  askSuggestion2: 'Which foods should I avoid?',
  askSuggestion3: 'When should I see a doctor?',
};

const hi: Translations = {
  poweredBy: 'Gemini Vision द्वारा संचालित',
  title: 'HealthScan',
  subtitle: 'कोई भी मेडिकल रिपोर्ट अपलोड करें — खून की जांच, MRI, CT, X-ray, नुस्खे। Gemini पढ़ता है, विश्लेषण करता है, और आगे के कदम बताता है।',
  patientDetails: 'मरीज़ की जानकारी',
  fullName: 'पूरा नाम *',
  fullNamePlaceholder: 'जैसे राहुल शर्मा',
  age: 'उम्र',
  agePlaceholder: '30',
  gender: 'लिंग',
  male: 'पुरुष',
  female: 'महिला',
  other: 'अन्य',
  city: 'शहर *',
  cityPlaceholder: 'जैसे मुंबई',
  whatsapp: 'WhatsApp नंबर',
  whatsappPlaceholder: '+91... (अल्पविराम से अलग करें)',
  dropFile: 'मेडिकल फ़ाइल यहाँ छोड़ें',
  dropFileHint: 'तस्वीरें (JPG, PNG) या PDF — खून की जांच, MRI, CT, X-Ray, नुस्खे',
  clickToChange: 'बदलने के लिए क्लिक करें',
  runAnalysis: 'गहरा विश्लेषण शुरू करें',
  analyzing: 'विश्लेषण हो रहा है...',
  fillRequired: 'कृपया नाम, शहर भरें और फ़ाइल अपलोड करें।',
  readyToAnalyze: 'विश्लेषण के लिए तैयार',
  readyHint: 'मरीज़ की जानकारी भरें, मेडिकल दस्तावेज़ अपलोड करें, और "गहरा विश्लेषण शुरू करें" पर क्लिक करें।',
  thinkingTitle: 'Gemini Agent — सोचने की प्रक्रिया',
  geminiReading: 'Gemini Vision आपके मेडिकल दस्तावेज़ को पढ़ और विश्लेषण कर रहा है...',
  processing: 'प्रक्रिया जारी है...',
  done: '✓ पूर्ण',
  failed: '✗ विफल',
  waiting: 'प्रतीक्षारत',
  stepRead: 'आपके मेडिकल दस्तावेज़ को पढ़ रहे हैं',
  stepAnalyze: 'सभी निष्कर्षों का विश्लेषण',
  stepEmergency: 'गंभीर मानों की जांच',
  stepClinics: 'नज़दीकी क्लीनिक खोज रहे हैं',
  stepReport: 'पूरी रिपोर्ट तैयार कर रहे हैं',
  emergencyTitle: 'गंभीर आपातकाल पाया गया',
  emergencyDefault: 'तुरंत चिकित्सा सहायता लें',
  callAmbulance: '108 पर कॉल करें',
  tabOverview: 'सारांश',
  tabReport: 'पूरी रिपोर्ट',
  tabImages: 'तस्वीरें',
  tabCost: 'खर्च का अनुमान',
  tabClinics: 'क्लीनिक',
  tabWhatsApp: 'WhatsApp',
  selectLanguage: 'भाषा',
  analysisComplete: 'विश्लेषण पूर्ण!',
  analysisFailed: 'विश्लेषण विफल',
  // Overview Tab
  healthScore: 'स्वास्थ्य स्कोर',
  outOf10: '10 में से',
  urgencyLevel: 'तत्काल स्तर',
  seeSpecialist: 'विशेषज्ञ से मिलें:',
  imagingScan: 'इमेजिंग स्कैन',
  executiveSummary: 'कार्यकारी सारांश',
  keyFindings: 'मुख्य निष्कर्ष',
  conditionsDetected: 'पाई गई बीमारियां',
  goToERIf: '🚨 तुरंत आपातकालीन कक्ष में जाएं यदि:',
  callFreeAmbulance: 'मुफ़्त एम्बुलेंस के लिए 108 डायल करें',
  // Report Tab
  fullMedicalReport: 'पूरी मेडिकल रिपोर्ट',
  download: 'डाउनलोड करें',
  actionPlan: 'कार्य योजना',
  doToday: 'आज करें',
  thisWeek: 'इस सप्ताह',
  thisMonth: 'इस महीने',
  doctorVisitGuide: '👨‍⚕️ डॉक्टर के पास जाने की गाइड',
  see: 'मिलें:',
  bringToAppointment: 'साथ लाएं:',
  questionsToAsk: 'पूछने के लिए प्रश्न:',
  // Cost Tab
  medicalCostEstimator: 'चिकित्सा लागत अनुमानक',
  indiaSpecific: 'भारत विशिष्ट',
  estimatedTotalCost: 'अनुमानित कुल उपचार लागत',
  basedOn: 'आधारित:',
  costBreakdown: 'लागत विवरण',
  monthlyOngoingCost: 'मासिक चालू लागत',
  perMonth: '/महीना',
  consultations: 'परामर्श',
  diagnosticTests: 'डायग्नोस्टिक टेस्ट और स्कैन',
  medicines: 'दवाएं',
  proceduresSurgeries: 'प्रक्रियाएं / सर्जरी',
  moneySavingTips: '💡 पैसे बचाने के टिप्स',
  insuranceGovSchemes: '🛡️ बीमा और सरकारी योजनाएं',
  noConsultations: 'कोई परामर्श सूचीबद्ध नहीं है।',
  noTests: 'कोई परीक्षण सूचीबद्ध नहीं है।',
  noMedicines: 'कोई दवा सूचीबद्ध नहीं है।',
  noProcedures: 'कोई प्रक्रिया सूचीबद्ध नहीं है।',
  costNotAvailable: 'लागत अनुमान उपलब्ध नहीं है। जनरेट करने के लिए विश्लेषण फिर से चलाएं।',
  duration: 'अवधि:',
  items: 'वस्तुएं',
  item: 'वस्तु',
  // Chat
  askAI: 'AI से पूछें',
  askAITitle: 'HealthScan AI से पूछें',
  askAISubtitle: 'अपनी रिपोर्ट के बारे में कुछ भी पूछें',
  askPlaceholder: 'जैसे मेरा हीमोग्लोबिन स्तर खतरनाक है?',
  askSend: 'भेजें',
  askThinking: 'सोच रहा है...',
  askDisclaimer: 'AI उत्तर केवल आपकी रिपोर्ट पर आधारित हैं। हमेशा डॉक्टर से सलाह लें।',
  askSuggestion1: 'मेरे स्वास्थ्य स्कोर का क्या मतलब है?',
  askSuggestion2: 'मुझे कौन से खाद्य पदार्थों से बचना चाहिए?',
  askSuggestion3: 'मुझे डॉक्टर के पास कब जाना चाहिए?',
};

const bn: Translations = {
  poweredBy: 'Gemini Vision চালিত',
  title: 'HealthScan',
  subtitle: 'যেকোনো মেডিক্যাল রিপোর্ট আপলোড করুন — রক্ত পরীক্ষা, MRI, CT, X-ray, প্রেসক্রিপশন। Gemini পড়ে, বিশ্লেষণ করে, এবং পরবর্তী পদক্ষেপ জানায়।',
  patientDetails: 'রোগীর তথ্য',
  fullName: 'পুরো নাম *',
  fullNamePlaceholder: 'যেমন রাহুল শর্মা',
  age: 'বয়স',
  agePlaceholder: '৩০',
  gender: 'লিঙ্গ',
  male: 'পুরুষ',
  female: 'মহিলা',
  other: 'অন্যান্য',
  city: 'শহর *',
  cityPlaceholder: 'যেমন কলকাতা',
  whatsapp: 'WhatsApp নম্বর',
  whatsappPlaceholder: '+91... (কমা দিয়ে আলাদা করুন)',
  dropFile: 'মেডিক্যাল ফাইল এখানে ছেড়ে দিন',
  dropFileHint: 'ছবি (JPG, PNG) বা PDF — রক্ত পরীক্ষা, MRI, CT, X-Ray, প্রেসক্রিপশন',
  clickToChange: 'পরিবর্তন করতে ক্লিক করুন',
  runAnalysis: 'গভীর বিশ্লেষণ চালান',
  analyzing: 'বিশ্লেষণ চলছে...',
  fillRequired: 'দয়া করে নাম, শহর পূরণ করুন এবং ফাইল আপলোড করুন।',
  readyToAnalyze: 'বিশ্লেষণের জন্য প্রস্তুত',
  readyHint: 'রোগীর তথ্য পূরণ করুন, মেডিক্যাল ডকুমেন্ট আপলোড করুন, এবং "গভীর বিশ্লেষণ চালান" ক্লিক করুন।',
  thinkingTitle: 'Gemini Agent — চিন্তার প্রক্রিয়া',
  geminiReading: 'Gemini Vision আপনার মেডিক্যাল ডকুমেন্ট পড়ছে এবং বিশ্লেষণ করছে...',
  processing: 'প্রক্রিয়াকরণ চলছে...',
  done: '✓ সম্পন্ন',
  failed: '✗ ব্যর্থ',
  waiting: 'অপেক্ষারত',
  stepRead: 'আপনার মেডিক্যাল ডকুমেন্ট পড়া হচ্ছে',
  stepAnalyze: 'সমস্ত ফলাফল বিশ্লেষণ',
  stepEmergency: 'গুরুতর মান পরীক্ষা',
  stepClinics: 'কাছাকাছি ক্লিনিক খোঁজা হচ্ছে',
  stepReport: 'সম্পূর্ণ রিপোর্ট তৈরি হচ্ছে',
  emergencyTitle: 'গুরুতর জরুরি অবস্থা সনাক্ত হয়েছে',
  emergencyDefault: 'অবিলম্বে চিকিৎসা সহায়তা নিন',
  callAmbulance: '108 কল করুন',
  tabOverview: 'সারসংক্ষেপ',
  tabReport: 'সম্পূর্ণ রিপোর্ট',
  tabImages: 'ছবি',
  tabCost: 'খরচের অনুমান',
  tabClinics: 'ক্লিনিক',
  tabWhatsApp: 'WhatsApp',
  selectLanguage: 'ভাষা',
  analysisComplete: 'বিশ্লেষণ সম্পন্ন!',
  analysisFailed: 'বিশ্লেষণ ব্যর্থ হয়েছে',
  // Overview Tab
  healthScore: 'স্বাস্থ্য স্কোর',
  outOf10: '10 এর মধ্যে',
  urgencyLevel: 'জরুরী স্তর',
  seeSpecialist: 'বিশেষজ্ঞ দেখান:',
  imagingScan: 'ইমেজিং স্ক্যান',
  executiveSummary: 'কার্যনির্বাহী সারাংশ',
  keyFindings: 'প্রধান ফলাফল',
  conditionsDetected: 'শনাক্ত করা রোগ',
  goToERIf: '🚨 অবিলম্বে ইমার্জেন্সিতে যান যদি:',
  callFreeAmbulance: 'ফ্রি অ্যাম্বুলেন্সের জন্য ১০৮ নম্বরে কল করুন',
  // Report Tab
  fullMedicalReport: 'সম্পূর্ণ মেডিক্যাল রিপোর্ট',
  download: 'ডাউনলোড করুন',
  actionPlan: 'কর্ম পরিকল্পনা',
  doToday: 'আজ করুন',
  thisWeek: 'এই সপ্তাহে',
  thisMonth: 'এই মাসে',
  doctorVisitGuide: '👨‍⚕️ ডাক্তার পরিদর্শনের গাইড',
  see: 'দেখান:',
  bringToAppointment: 'সাথে আনুন:',
  questionsToAsk: 'যে প্রশ্নগুলো করবেন:',
  // Cost Tab
  medicalCostEstimator: 'চিকিৎসা খরচের হিসাবকারী',
  indiaSpecific: 'ভারত নির্দিষ্ট',
  estimatedTotalCost: 'আনুমানিক মোট চিকিৎসার খরচ',
  basedOn: 'ভিত্তি করে:',
  costBreakdown: 'খরচের বিবরণ',
  monthlyOngoingCost: 'মাসিক চলমান খরচ',
  perMonth: '/মাস',
  consultations: 'পরামর্শ',
  diagnosticTests: 'ডায়াগনস্টিক টেস্ট ও স্ক্যান',
  medicines: 'ওষুধ',
  proceduresSurgeries: 'পদ্ধতি / সার্জারি',
  moneySavingTips: '💡 টাকা বাঁচানোর টিপস',
  insuranceGovSchemes: '🛡️ বীমা এবং সরকারী স্কিম',
  noConsultations: 'কোন পরামর্শ তালিকাভুক্ত নেই।',
  noTests: 'কোন পরীক্ষা তালিকাভুক্ত নেই।',
  noMedicines: 'কোন ওষুধ তালিকাভুক্ত নেই।',
  noProcedures: 'কোন পদ্ধতি তালিকাভুক্ত নেই।',
  costNotAvailable: 'খরচের হিসাব পাওয়া যায়নি। তৈরি করতে পুনরায় বিশ্লেষণ চালান।',
  duration: 'সময়কাল:',
  items: 'আইটেম',
  item: 'আইটেম',
  // Chat
  askAI: 'AI-কে জিজ্ঞেস করুন',
  askAITitle: 'HealthScan AI-কে জিজ্ঞেস করুন',
  askAISubtitle: 'আপনার রিপোর্ট সম্পর্কে যেকোনো কিছু জিজ্ঞেস করুন',
  askPlaceholder: 'যেমন আমার হিমোগ্লোবিন কি বিপজ্জনক?',
  askSend: 'পাঠান',
  askThinking: 'ভাবছি...',
  askDisclaimer: 'AI উত্তরগুলি শুধুমাত্র আপনার রিপোর্টের উপর ভিত্তি করে। সর্বদা ডাক্তারের পরামর্শ নিন।',
  askSuggestion1: 'আমার স্বাস্থ্য স্কোরের মানে কী?',
  askSuggestion2: 'আমার কোন খাবার এড়ানো উচিত?',
  askSuggestion3: 'আমার কখন ডাক্তার দেখানো উচিত?',
};

const translations: Record<Language, Translations> = { English: en, Hindi: hi, Bengali: bn };

interface LanguageContextType {
  language: Language;
  // eslint-disable-next-line no-unused-vars
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'English',
  setLanguage: () => { },
  t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('English');
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
