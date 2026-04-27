import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { question, context, language } = await req.json();

    if (!question || !context) {
      return NextResponse.json({ error: 'Missing question or context' }, { status: 400 });
    }

    const langInstr = language === 'Hindi'
      ? 'Answer in Hindi (Devanagari script). Keep medical terms in English but explain in Hindi.'
      : language === 'Bengali'
        ? 'Answer in Bengali (Bengali script). Keep medical terms in English but explain in Bengali.'
        : 'Answer in clear, simple English.';

    const systemPrompt = `You are HealthScan AI, a helpful and empathetic medical assistant. You have access to a specific patient's medical report and analysis. Answer the user's question based ONLY on the provided medical context. Be clear, friendly, and avoid alarming language. Always recommend consulting a real doctor for final decisions.

PATIENT MEDICAL CONTEXT:
${JSON.stringify(context, null, 2)}

${langInstr}

Rules:
- Answer ONLY based on the provided medical context.
- Keep answers concise and easy to understand (2-4 sentences max unless detail is needed).
- Do NOT make up information not present in the context.
- Always remind the user to consult a real doctor for serious decisions.
- Never diagnose. Only explain the findings from the report.`;

    const resp = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nPatient Question: ${question}` }] }
      ]
    });

    return NextResponse.json({ answer: resp.text ?? 'Sorry, I could not generate an answer. Please try again.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
