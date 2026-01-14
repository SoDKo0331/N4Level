
import { GoogleGenAI } from "@google/genai";

// Following guidelines to initialize GoogleGenAI with the API key from process.env.API_KEY
// and creating a new instance before each request to ensure the most up-to-date configuration.

export const getGrammarExplanation = async (pattern: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Япон хэлний N4 түвшний "${pattern}" гэх дүрмийн бүтцийг Монгол хэлээр маш ойлгомжтой тайлбарлаж өгнө үү. Жишээ өгүүлбэрүүд болон ямар тохиолдолд хэрэглэдэг болохыг оруулна уу. JSON биш, Markdown форматаар хариулна уу.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу.";
  }
};

export const getMnemonicStory = async (kanji: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `"${kanji}" гэх ханзыг цээжлэхэд туслах хөгжилтэй эсвэл сонирхолтой богино түүх (mnemonic story) Монгол хэлээр зохиож өгнө үү.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Түүх олдсонгүй.";
  }
};
