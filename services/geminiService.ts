
import { GoogleGenAI } from "@google/genai";
import { Measurement, Member, BodyMeasurement, AIAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWorkoutPlan = async (clientName: string, measurements: Measurement[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set REACT_APP_GEMINI_API_KEY.";
  }

  const latest = measurements[measurements.length - 1];
  const prompt = `
    Act as a professional fitness coach. Create a brief weekly workout summary for a client named ${clientName}.
    Their current stats are: Weight ${latest.weight}kg, IMC ${latest.imc}, Waist ${latest.waist}cm.
    Based on their evolution (they started at ${measurements[0].weight}kg), suggest 3 key focus areas for this week.
    Keep it encouraging and concise (under 150 words). Format in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating plan. Please try again later.";
  }
};

export const analyzeFinancials = async (incomeData: any[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Demo Mode: Configure API Key for real insights.";
    }
    const prompt = `
      Analyze this gym financial data: ${JSON.stringify(incomeData)}.
      Identify the trend and give 2 strategic recommendations to increase revenue next month.
      Keep it professional and short.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No analysis available.";
    } catch (error) {
        return "Error analyzing data.";
    }
}

export const analyzeMemberProgress = async (member: Member, measurements: BodyMeasurement[]): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    return {
      trend: 'neutral',
      summary: "API Key not configured. Demo mode.",
      advice: "Please configure your Gemini API Key to enable smart analysis."
    };
  }

  const prompt = `
    Analyze the physical progress of member ${member.fullName}.
    Data History: ${JSON.stringify(measurements)}
    
    Return a JSON object with:
    1. trend: "positive", "negative", or "neutral"
    2. summary: A 1-sentence summary of their progress.
    3. advice: A short paragraph of advice for their next training phase.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as AIAnalysisResult;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      trend: 'neutral',
      summary: "Could not generate analysis.",
      advice: "Please check your connection and try again."
    };
  }
};
