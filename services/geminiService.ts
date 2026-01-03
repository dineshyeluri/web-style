
import { GoogleGenAI, Type } from "@google/genai";
import { HeroContent } from "../types";

export const generateHeroContent = async (industry: string): Promise<HeroContent | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Design high-concept website copy for a premium studio in '${industry}'.
      - Headline: Short, evocative, and powerful. 2-3 words maximum. Upper case. Examples: 'BEYOND BORDERS', 'PURE VELOCITY', 'INFINITE VISION'.
      - Subheadline: One short, elegant sentence. Maximum 12 words.
      - CTA: Minimalist action. 1-2 words.
      Focus on luxury and technical precision.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            ctaText: { type: Type.STRING }
          },
          required: ["headline", "subheadline", "ctaText"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as HeroContent;
    }
  } catch (error) {
    console.error("Gemini Error:", error);
  }
  return null;
};
