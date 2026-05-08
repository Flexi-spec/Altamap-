import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function moderateContent(content: string): Promise<{ isSafe: boolean; reason?: string; category?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Moderate the following Christian platform content for toxicity, spam, explicit material, or fake ministry scams. 
      Content: "${content}"
      
      Respond in JSON format with:
      {
        "isSafe": boolean,
        "reason": "string describing why if unsafe",
        "category": "string (e.g., 'worship', 'testimony', 'lifestyle', 'spam')"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["isSafe"]
        }
      }
    });

    return JSON.parse(response.text || '{"isSafe": true}');
  } catch (error) {
    console.error("Moderation error:", error);
    return { isSafe: true }; // Default to safe if AI fails, but ideally log for human review
  }
}

export async function recommendContent(userInterests: string[]): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on a user's interest in ${userInterests.join(", ")}, suggest 5 gospel music genres or Christian content themes they might enjoy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}
