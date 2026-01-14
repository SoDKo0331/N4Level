import { GoogleGenAI } from "@google/genai";

const createAI = () =>
  new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

function extractText(result: any): string {
  // ✅ New JS SDKs commonly expose text directly
  if (typeof result?.text === "string" && result.text.trim()) return result.text.trim();

  // ✅ Fallback: candidates -> parts -> text
  const parts = result?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const t = parts.map((p: any) => p?.text).filter(Boolean).join("").trim();
    if (t) return t;
  }

  // Some older/other examples used result.response.text(), but keep a safe fallback
  const maybeResponse = result?.response;
  if (typeof maybeResponse?.text === "string" && maybeResponse.text.trim()) return maybeResponse.text.trim();
  if (typeof maybeResponse?.text === "function") {
    const t = maybeResponse.text();
    if (typeof t === "string" && t.trim()) return t.trim();
  }

  return "";
}

function debugEmpty(result: any) {
  const finishReason =
    result?.candidates?.[0]?.finishReason ??
    result?.response?.candidates?.[0]?.finishReason;

  const safetyRatings =
    result?.candidates?.[0]?.safetyRatings ??
    result?.response?.candidates?.[0]?.safetyRatings;

  console.error("Gemini returned empty text. Debug:", {
    finishReason,
    safetyRatings,
    result,
  });
}

export const getGrammarExplanation = async (pattern: string): Promise<string> => {
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

    const text = extractText(result);
    if (!text) {
      debugEmpty(result);
      throw new Error("No response text returned from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу.";
  }
};

export const getMnemonicStory = async (kanji: string): Promise<string> => {
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

    const text = extractText(result);
    if (!text) {
      debugEmpty(result);
      throw new Error("No response text returned from Gemini API");
    }
    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Түүх олдсонгүй.";
  }
};
