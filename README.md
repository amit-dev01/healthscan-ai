# HealthScan AI 🏥

An autonomous medical report analyzer powered by Google Gemini 2.0 Flash Lite.

## Features
- **Intelligent Extraction**: Uses Gemini Vision to parse blood reports, MRI/CT scans, X-rays, and prescriptions.
- **Deep Analysis**: Provides detailed insights into medical findings with an urgency assessment.
- **Emergency Detection**: Real-time checking for critical health values.
- **Clinic Finder**: Integrated with Google Places API to find specialists in your city.
- **WhatsApp Integration**: Sends reports directly to your phone via Twilio.

## Getting Started

1. **Setup Environment**:
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=AIzaSyCctS7GocKEHqSUm6rEZnZHLtHwZPVL3T4
   GOOGLE_PLACES_API_KEY=your_key
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_FROM=your_number
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Tech Stack
- Next.js 14
- Tailwind CSS
- Framer Motion
- Google Gemini API (Function Calling)
- Google Places API
- Twilio API
