
import { GoogleGenAI } from "@google/genai";

// GUIDELINE: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAudio(file: File): Promise<string> {
  try {
    const base64Data = await fileToBase64(file);
    
    // Using gemini-3-flash-preview for simple text tasks like audio description
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type || 'audio/mpeg',
              data: base64Data,
            },
          },
          {
            text: "Describe this audio content in exactly one short, punchy sentence. Focus on the main sound, mood, or speech content."
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // GUIDELINE: The response object features a text property (not a method).
    return response.text || "Audio processed successfully.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI insight unavailable for this format.";
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Correctly extract the base64 string from the data URL
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}
