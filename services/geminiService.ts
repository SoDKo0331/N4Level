import { GoogleGenAI } from "@google/genai";

const createAI = () =>
  new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

/**
 * Ask Gemini for a grammar explanation.
 *
 * The underlying API sometimes returns an object without a `response` field
 * (for example when the request fails or the quota is exhausted). In that
 * case `result.response` will be undefined and calling `.text()` would
 * throw a `Cannot read properties of undefined (reading 'text')` error.  To
 * avoid breaking the UI with that exception, we explicitly guard against
 * missing responses and return a fallback message instead.
 *
 * @param pattern – The grammar pattern to explain.
 */
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

    // Prefer the convenience helper if it's available.
    const response = (result as any)?.response;
    if (response && typeof response.text === "function") {
      const text = response.text();
      if (text) return text;
    }

    // Fallback: attempt to extract text from the first candidate.
    const candidates = (result as any)?.response?.candidates;
    const rawText = Array.isArray(candidates)
      ? candidates
          .flatMap((c: any) => c?.content?.parts || [])
          .map((p: any) => p?.text)
          .filter(Boolean)
          .join("\n")
      : null;
    if (rawText) return rawText;

    throw new Error("No response text returned from Gemini API");
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу.";
  }
};

/**
 * Ask Gemini for a mnemonic story for a given kanji.
 *
 * This mirrors the same error-handling strategy as `getGrammarExplanation`:
 * guard against missing `response` fields and extract text from the
 * returned candidates when available.  Without these guards the app
 * would throw a TypeError when trying to call `.text()` on an undefined
 * object, leading to a blank screen.
 *
 * @param kanji – The Kanji character to get a mnemonic story for.
 */
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

    const response = (result as any)?.response;
    if (response && typeof response.text === "function") {
      const text = response.text();
      if (text) return text;
    }

    const candidates = (result as any)?.response?.candidates;
    const rawText = Array.isArray(candidates)
      ? candidates
          .flatMap((c: any) => c?.content?.parts || [])
          .map((p: any) => p?.text)
          .filter(Boolean)
          .join("\n")
      : null;
    if (rawText) return rawText;

    throw new Error("No response text returned from Gemini API");
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Түүх олдсонгүй.";
  }
};