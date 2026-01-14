import { GoogleGenAI } from "@google/genai";

const createAI = () =>
  new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

export const getGrammarExplanation = async (pattern: string) => {
  try {
    const ai = createAI();

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Япон хэлний N4 түвшний "${pattern}" гэх дүрмийн бүтцийг Монгол хэлээр маш ойлгомжтой тайлбарлаж өгнө үү.
Жишээ өгүүлбэрүүд болон ямар тохиолдолд хэрэглэдэг болохыг оруулна уу.
JSON биш, Markdown форматаар хариулна уу.`,
            },
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу.";
  }
};

export const getMnemonicStory = async (kanji: string) => {
  try {
    const ai = createAI();

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `"${kanji}" гэх ханзыг цээжлэхэд туслах хөгжилтэй эсвэл сонирхолтой богино түүх (mnemonic story) Монгол хэлээр зохиож өгнө үү.`,
            },
          ],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Түүх олдсонгүй.";
  }
};
