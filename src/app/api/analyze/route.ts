import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Helper to robustly extract JSON from model output
// Handles: bare JSON, ```json...```, ``` ... ```, extra commentary, etc.
function stripJson(text: string): string {
  // Try to find the outermost JSON object
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }
  // Fallback: strip common markdown fences
  return text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
}

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const age = formData.get('age') as string;
    const gender = formData.get('gender') as string;
    const city = formData.get('city') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const language = (formData.get('language') as string) || 'English';

    // Language instruction injected into every prompt
    const langInstr = language === 'Hindi'
      ? 'IMPORTANT: Write ALL text content (summaries, findings, action plans, explanations, report) in Hindi (Devanagari script). Keep medical terms in English but explain them in Hindi.'
      : language === 'Bengali'
        ? 'IMPORTANT: Write ALL text content (summaries, findings, action plans, explanations, report) in Bengali (Bengali script). Keep medical terms in English but explain them in Bengali.'
        : 'Write all text content in clear, simple English.';

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const b64 = Buffer.from(bytes).toString('base64');
    const mimeType = (file.type || 'image/jpeg') as string;

    const MODEL = "gemini-flash-latest";

    // ==========================================================
    // STAGE 1: VISION EXTRACTION
    // ==========================================================
    console.log("Stage 1: Vision Extraction...");

    const extractionPrompt = `You are an expert medical data extractor. Analyze this medical document for patient ${name} (${age}yo ${gender}).

STEP 1: Identify the document type exactly: Blood Report / MRI Report / CT Scan / X-Ray / Prescription / Lab Report / Other.

STEP 2: Extract ALL data and return ONLY valid JSON (no markdown, no extra text):
{
  "documentType": "Blood Report",
  "isImagingScan": false,
  "extractedData": {
    "parameters": [
      { "name": "Hemoglobin", "value": "9.2", "unit": "g/dL", "normalRange": "12-16", "status": "LOW" }
    ],
    "findings": ["Finding 1"],
    "impression": "Overall impression",
    "medicines": [],
    "radiologistNotes": ""
  },
  "imagingRegions": []
}

For imaging scans (MRI/CT/X-Ray), populate imagingRegions:
[
  { "region": "Left lung lower lobe", "finding": "Opacity noted", "severity": "CRITICAL", "xPercent": 35, "yPercent": 65, "widthPercent": 15, "heightPercent": 20 }
]
severity options: CRITICAL, ABNORMAL, MONITOR, NORMAL
xPercent/yPercent/widthPercent/heightPercent = percentage position on image (0-100).
${langInstr}
Return ONLY valid JSON.`;

    const extractionResp = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: extractionPrompt },
            { inlineData: { data: b64, mimeType } }
          ]
        }
      ]
    });

    const extractedRaw = stripJson(extractionResp.text ?? '');
    let extractedData: Record<string, unknown> = {};
    try {
      extractedData = JSON.parse(extractedRaw);
    } catch {
      extractedData = {
        documentType: "Medical Report",
        isImagingScan: false,
        extractedData: { rawText: extractedRaw },
        imagingRegions: []
      };
    }
    console.log("Stage 1 done. Type:", extractedData.documentType);

    // ==========================================================
    // STAGE 2: DEEP ANALYSIS
    // ==========================================================
    console.log("Stage 2: Deep Analysis...");

    const analysisPrompt = `You are HealthScan AI, an expert medical analyst.

Patient: ${name}, ${age}yo ${gender}, City: ${city}
Document Type: ${extractedData.documentType}

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

Perform a comprehensive analysis and return ONLY valid JSON (no markdown):
{
  "healthScore": 7.2,
  "urgency": "CONSULT",
  "isEmergency": false,
  "emergencyReason": "",
  "specialistNeeded": "Cardiologist",
  "executiveSummary": "3-4 simple sentences explaining overall findings...",
  "keyFindings": [
    { "name": "Low Hemoglobin", "what": "9.2 g/dL (Normal: 12-16)", "status": "CONCERNING", "explanation": "Red blood cell count below normal range..." }
  ],
  "conditionsDetected": [
    { "name": "Iron Deficiency Anemia", "confidence": "LIKELY", "explanation": "Multiple markers suggest..." }
  ],
  "actionPlan": {
    "today": ["Drink 3 liters of water today", "Avoid strenuous exercise"],
    "thisWeek": ["Get urine test done", "Start iron-rich diet from tomorrow"],
    "thisMonth": ["Follow-up blood test in 4 weeks", "30-minute daily walk"]
  },
  "doctorVisitGuide": {
    "specialist": "Hematologist",
    "urgency": "Within 7 days",
    "bringToAppointment": ["Previous blood reports", "List of current medicines"],
    "questionsToAsk": ["What is causing my low hemoglobin?", "Do I need iron supplements?", "Are there dietary changes required?"]
  },
  "dietAndLifestyle": {
    "eatMore": ["Spinach (iron-rich)", "Lentils and dals", "Pomegranate"],
    "avoid": ["Processed sugar", "Alcohol", "Excessive tea/coffee with meals"],
    "lifestyleChanges": ["8 hours sleep daily", "Light yoga or walking", "Reduce stress"]
  },
  "warningSignsGoToER": ["Severe chest pain", "Difficulty breathing", "Sudden loss of consciousness", "Vomiting blood"]
}

urgency must be: NORMAL, MONITOR, CONSULT, URGENT, or EMERGENCY
healthScore: 0-10 (10 = perfect health)
${langInstr}
Return ONLY valid JSON.`;

    const analysisResp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }]
    });

    const analysisRaw = stripJson(analysisResp.text ?? '');
    let analysis: Record<string, unknown> = {};
    try {
      analysis = JSON.parse(analysisRaw);
    } catch {
      analysis = {
        healthScore: 6,
        urgency: "CONSULT",
        isEmergency: false,
        emergencyReason: "",
        specialistNeeded: "General Physician",
        executiveSummary: "Analysis completed. Please consult a doctor for detailed interpretation.",
        keyFindings: [],
        conditionsDetected: [],
        actionPlan: { today: ["Consult a doctor today"], thisWeek: ["Get further tests done"], thisMonth: ["Follow-up with specialist"] },
        doctorVisitGuide: { specialist: "General Physician", urgency: "This week", bringToAppointment: ["This report"], questionsToAsk: ["What does this report indicate?"] },
        dietAndLifestyle: { eatMore: ["Balanced diet"], avoid: ["Junk food"], lifestyleChanges: ["Regular exercise"] },
        warningSignsGoToER: ["Severe chest pain", "Difficulty breathing"]
      };
    }
    console.log("Stage 2 done. Score:", analysis.healthScore, "Urgency:", analysis.urgency);

    // ==========================================================
    // STAGE 2.5: COST ESTIMATION
    // ==========================================================
    console.log("Stage 2.5: Estimating costs...");

    const conditions = (analysis.conditionsDetected as Array<Record<string, string>> || []).map(c => c.name).join(', ');
    const specialist = analysis.specialistNeeded as string || 'General Physician';

    const costPrompt = `You are a medical cost estimation expert for India. Based on the following detected conditions and required specialist, estimate the realistic cost breakdown in Indian Rupees (₹).

Patient City: ${city}
Conditions Detected: ${conditions || 'General evaluation needed'}
Specialist Needed: ${specialist}
Document Type: ${extractedData.documentType}
Key Findings: ${((analysis.keyFindings as Array<Record<string, string>>) || []).map(f => f.name).join(', ')}

Provide realistic Indian cost estimates (Government hospital = lowest, Private hospital = highest).
Return ONLY valid JSON (no markdown):
{
  "totalEstimateMin": 5000,
  "totalEstimateMax": 25000,
  "currency": "INR",
  "disclaimer": "Costs are approximate estimates for India. Actual costs vary by city, hospital type, and insurance coverage.",
  "consultations": [
    { "name": "General Physician (initial)", "minCost": 300, "maxCost": 800, "notes": "First visit consultation" },
    { "name": "Cardiologist", "minCost": 700, "maxCost": 1500, "notes": "Specialist consultation" }
  ],
  "diagnosticTests": [
    { "name": "CBC (Complete Blood Count)", "minCost": 200, "maxCost": 600, "urgency": "Recommended", "notes": "Available at any lab" },
    { "name": "ECG", "minCost": 150, "maxCost": 500, "urgency": "Recommended", "notes": "Standard cardiac test" }
  ],
  "medicines": [
    { "name": "Iron Supplement (Ferrous Sulfate)", "minCost": 50, "maxCost": 200, "duration": "3 months", "notes": "OTC available" }
  ],
  "procedures": [
    { "name": "Echocardiography", "minCost": 2000, "maxCost": 5000, "notes": "If cardiac issue confirmed" }
  ],
  "monthlyOngoingCost": {
    "min": 500,
    "max": 2000,
    "notes": "Ongoing medicines + follow-up visits"
  },
  "insuranceTips": [
    "Check if your health insurance covers specialist consultation",
    "Government hospitals (like AIIMS, Civil Hospital) offer subsidized rates",
    "Ayushman Bharat covers many conditions for eligible families"
  ],
  "savingTips": [
    "Get tests done at government diagnostic centers for 50-70% savings",
    "Generic medicines are equally effective at 1/5th the cost"
  ]
}
${langInstr}
Return ONLY valid JSON.`;

    const costResp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: costPrompt }] }]
    });

    const costRaw = stripJson(costResp.text ?? '');
    let costEstimate: Record<string, unknown> = {};
    try {
      costEstimate = JSON.parse(costRaw);
    } catch {
      costEstimate = {
        totalEstimateMin: 2000,
        totalEstimateMax: 15000,
        currency: "INR",
        disclaimer: "Costs are approximate. Consult your hospital for exact pricing.",
        consultations: [{ name: "General Physician", minCost: 300, maxCost: 800, notes: "Initial visit" }],
        diagnosticTests: [],
        medicines: [],
        procedures: [],
        monthlyOngoingCost: { min: 500, max: 2000, notes: "Estimated ongoing costs" },
        insuranceTips: ["Check your health insurance policy for coverage details."],
        savingTips: ["Government hospitals offer lower rates than private hospitals."]
      };
    }
    console.log("Stage 2.5 done. Cost range: ₹", costEstimate.totalEstimateMin, "-", costEstimate.totalEstimateMax);

    // ==========================================================
    // STAGE 3: FULL 11-SECTION REPORT
    // ==========================================================
    console.log("Stage 3: Generating full report...");

    const reportSections = language === 'Hindi'
      ? `## खंड 1: रोगी सारांश
## खंड 2: कार्यकारी सारांश
## खंड 3: मुख्य निष्कर्ष
## खंड 4: विस्तृत विश्लेषण
## खंड 5: पाई गई बीमारियां
## खंड 6: कार्य योजना
### आज करें:
### इस सप्ताह:
### इस महीने:
## खंड 7: डॉक्टर के पास जाने की गाइड
## खंड 8: आहार और जीवनशैली
## खंड 9: चेतावनी के संकेत
## खंड 10: नज़दीकी क्लीनिक
(क्लीनिक की जानकारी अलग से दिखाई जाएगी)
## खंड 11: अस्वीकरण
*यह रिपोर्ट AI (HealthScan AI, Google Gemini द्वारा संचालित) द्वारा तैयार की गई है। यह केवल जानकारी के उद्देश्य से है और चिकित्सा निदान नहीं है। हमेशा योग्य डॉक्टर से परामर्श लें। आपातकाल में 108 (भारत में मुफ्त एम्बुलेंस सेवा) पर कॉल करें।*`
      : language === 'Bengali'
      ? `## বিভাগ ১: রোগীর সারসংক্ষেপ
## বিভাগ ২: কার্যনির্বাহী সারাংশ
## বিভাগ ৩: প্রধান ফলাফল
## বিভাগ ৪: বিস্তারিত বিশ্লেষণ
## বিভাগ ৫: শনাক্ত করা রোগ
## বিভাগ ৬: কর্ম পরিকল্পনা
### আজ করুন:
### এই সপ্তাহে:
### এই মাসে:
## বিভাগ ৭: ডাক্তার পরিদর্শনের গাইড
## বিভাগ ৮: খাদ্য এবং জীবনধারা
## বিভাগ ৯: সতর্কতার চিহ্ন
## বিভাগ ১০: কাছাকাছি ক্লিনিক
(ক্লিনিকের তথ্য আলাদাভাবে প্রদর্শিত হবে)
## বিভাগ ১১: দাবিত্যাগ
*এই রিপোর্ট AI (HealthScan AI, Google Gemini চালিত) দ্বারা তৈরি। এটি শুধুমাত্র তথ্যের উদ্দেশ্যে এবং চিকিৎসা নির্ণয় নয়। সর্বদা একজন যোগ্য ডাক্তারের পরামর্শ নিন। জরুরি অবস্থায় ১০৮ (ভারতে বিনামূল্যে অ্যাম্বুলেন্স পরিষেবা) কল করুন।*`
      : `## SECTION 1: PATIENT SUMMARY
## SECTION 2: EXECUTIVE SUMMARY
## SECTION 3: KEY FINDINGS
## SECTION 4: DETAILED ANALYSIS
## SECTION 5: CONDITIONS DETECTED
## SECTION 6: ACTION PLAN
### Do Today:
### This Week:
### This Month:
## SECTION 7: DOCTOR VISIT GUIDE
## SECTION 8: DIET AND LIFESTYLE
## SECTION 9: WARNING SIGNS
## SECTION 10: NEARBY CLINICS
(Clinic information will be displayed separately)
## SECTION 11: DISCLAIMER
*This report is generated by AI (HealthScan AI powered by Google Gemini). It is for informational purposes ONLY and is NOT a medical diagnosis. Always consult a qualified doctor. In an emergency, call 108 (free ambulance service in India).*`;

    const reportPrompt = `You are HealthScan AI. Write a complete, detailed 11-section medical report in Markdown for the following patient.

Patient: ${name} | Age: ${age} | Gender: ${gender} | Date: ${new Date().toLocaleDateString('en-IN')}
Document Type: ${extractedData.documentType}
Health Score: ${analysis.healthScore}/10 | Urgency: ${analysis.urgency}
Specialist Needed: ${analysis.specialistNeeded}

KEY ANALYSIS:
${JSON.stringify(analysis, null, 2)}

EXTRACTED VALUES:
${JSON.stringify((extractedData as Record<string, unknown>).extractedData || {}, null, 2)}

Write ALL 11 sections. Use clear headings, bullet points, and plain language that a non-medical person can understand.
Use Indian context (Indian foods, 108 ambulance, etc.).

${reportSections}

${langInstr}`;

    const reportResp = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: reportPrompt }] }]
    });

    const finalReport = reportResp.text ?? 'Report generation failed. Please try again.';
    console.log("Stage 3 done. Report length:", finalReport.length);

    // ==========================================================
    // STAGE 4: NEARBY CLINICS — Powered by Gemini (no Places API needed)
    // ==========================================================
    let clinics: unknown[] = [];
    let pharmacy: unknown = null;

    try {
      console.log("Stage 4: Gemini finding clinics in", city, "...");
      const specialist = (analysis.specialistNeeded as string) || "General Physician";

      const clinicPrompt = `You are a medical facility expert for India. List 5 real, well-known hospitals or clinics in ${city} that a patient needing a ${specialist} should visit.

Also suggest 1 well-known pharmacy chain in ${city}.

Return ONLY valid JSON (no markdown):
{
  "clinics": [
    {
      "name": "Apollo Hospital",
      "address": "Greams Road, Thousand Lights, Chennai - 600006",
      "area": "Thousand Lights",
      "rating": 4.5,
      "type": "Multi-speciality Hospital",
      "phone": "044-28293333",
      "mapsUrl": "https://www.google.com/maps/search/Apollo+Hospital+${encodeURIComponent(city)}"
    }
  ],
  "pharmacy": {
    "name": "Apollo Pharmacy",
    "address": "Near Apollo Hospital, ${city}",
    "area": "Central ${city}",
    "rating": 4.3,
    "type": "Pharmacy Chain",
    "phone": "1860-500-0101",
    "mapsUrl": "https://www.google.com/maps/search/Apollo+Pharmacy+${encodeURIComponent(city)}"
  }
}

Rules:
- Use REAL, well-known hospitals that actually exist in ${city} (e.g. Apollo, Fortis, AIIMS, Max, Manipal, Medanta, government hospitals, etc.)
- For the mapsUrl, use format: https://www.google.com/maps/search/HOSPITAL+NAME+CITY (URL-encoded)
- Include both government and private options
- Specialist needed: ${specialist}
- All 5 clinics must be in ${city} only
- Return ONLY valid JSON`;

      const clinicResp = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: clinicPrompt }] }]
      });

      const clinicRaw = stripJson(clinicResp.text ?? '');
      const clinicData = JSON.parse(clinicRaw);

      clinics = (clinicData.clinics || []).map((c: Record<string, unknown>) => ({
        name: c.name,
        address: c.address,
        rating: c.rating || 4.0,
        phone: c.phone || "Search on Google Maps",
        open_now: null,
        place_id: "",
        mapsUrl: c.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent((c.name as string) + ' ' + city)}`,
        area: c.area || "",
        type: c.type || "Hospital",
        geminiSuggested: true
      }));

      if (clinicData.pharmacy) {
        const p = clinicData.pharmacy;
        pharmacy = {
          name: p.name,
          address: p.address,
          rating: p.rating || 4.0,
          phone: p.phone || "Search on Google Maps",
          open_now: null,
          place_id: "",
          mapsUrl: p.mapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(p.name + ' ' + city)}`,
          area: p.area || "",
          type: "Pharmacy",
          geminiSuggested: true
        };
      }

      console.log("Stage 4 done. Found", clinics.length, "clinics via Gemini.");
    } catch (e) {
      console.error("Gemini clinic finder error:", e);
      // Fallback: generic Google Maps search links
      clinics = [
        {
          name: `${(analysis.specialistNeeded as string) || 'General Physician'} Clinics near you`,
          address: city,
          rating: 4.0,
          phone: "Search on Google Maps",
          open_now: null,
          place_id: "",
          mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${(analysis.specialistNeeded as string) || 'doctor'} ${city}`)}`,
          type: "Search Result",
          geminiSuggested: false
        }
      ];
    }

    // ==========================================================
    // STAGE 5: WHATSAPP (Removed — now handled client-side)
    // ==========================================================

    // Return full structured response
    return NextResponse.json({
      success: true,
      documentType: extractedData.documentType || "Medical Report",
      isImagingScan: !!(extractedData.isImagingScan),
      imagingRegions: extractedData.imagingRegions || [],
      extractedData: (extractedData as Record<string, unknown>).extractedData || {},
      analysis,
      costEstimate,
      report: finalReport,
      clinics,
      pharmacy,
      pharmacy,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("HealthScan Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
