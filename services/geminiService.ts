import { GoogleGenAI } from "@google/genai";

const createAI = () =>
  new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

function extractText(result: any): string {
  if (typeof result?.text === "string" && result.text.trim()) return result.text.trim();

  const parts = result?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const t = parts.map((p: any) => p?.text).filter(Boolean).join("").trim();
    if (t) return t;
  }

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

  console.error("Gemini returned empty text. Debug:", { finishReason, safetyRatings, result });
}

/** ---- Output Format Guards ---- */
const GRAMMAR_REQUIRED_HEADINGS = [
  "## 1) Товч ойлголт",
  "## 2) Хэрэглэх нөхцөл",
  "## 3) Бүтэц",
  "## 4) Нюанс ба ялгаа",
  "## 5) Жишээ өгүүлбэрүүд",
  "## 6) Түгээмэл алдаа",
  "## 7) Дасгал",
];

function looksLikeStructuredGrammar(md: string) {
  return GRAMMAR_REQUIRED_HEADINGS.every((h) => md.includes(h));
}

const MNEMONIC_REQUIRED_HEADINGS = [
  "## 1) Утга",
  "## 2) Дүрслэл (Visual hook)",
  "## 3) Богино түүх",
  "## 4) Түлхүүр өгүүлбэр",
];

function looksLikeStructuredMnemonic(md: string) {
  return MNEMONIC_REQUIRED_HEADINGS.every((h) => md.includes(h));
}

/** ---- Prompt Builders ---- */
function grammarPrompt(pattern: string) {
  return `
Чи Япон хэлний багш. JLPT N4 түвшний дүрмийг Монгол хэлээр маш ойлгомжтой, шат дараалалтай тайлбарлана.

**Дүрэм:** 「${pattern}」

### Заавар (заавал мөрдөнө)
- Хариултыг **Markdown** хэлбэрээр өг.
- Доорх гарчгуудыг яг энэ байдлаар **заавал** ашигла. (гарчиг дутуу бол буруу гэж үзнэ)
- Хэт урт онол бүү бич. **Ойлгомжтой, практик** бай.

### Хариултын бүтэц (яг энэ дарааллаар)
# 「${pattern}」 дүрмийн тайлбар

## 1) Товч ойлголт
- 1–2 өгүүлбэрээр хамгийн товч тайлбар.

## 2) Хэрэглэх нөхцөл
- 3–5 bullet: ямар нөхцөлд хэрэглэдэг вэ? (хэзээ/юуг илэрхийлэх вэ?)

## 3) Бүтэц
- Формула: (жишээ: V-る + … гэх мэт)
- Хэрвээ хувилбарууд байвал тусад нь bullet-р.

## 4) Нюанс ба ялгаа
- Адилхан 1–2 дүрэмтэй нь ялгааг 2–4 мөрөөр харьцуул.
- Ямар үед аль нь “зөв сонсогдох”-ыг тайлбарла.

## 5) Жишээ өгүүлбэрүүд
- Заавал 5 өгүүлбэр:
  - (JP) Япон өгүүлбэр
  - (MN) Монгол орчуулга
- Хамгийн багадаа 2 нь өдөр тутмын ярианы жишээ байх.
- Боломжтой бол нэг өгүүлбэрт анхаарах цэгийг **bold**-оор тэмдэглэ.

## 6) Түгээмэл алдаа
- 3 bullet: сурагчид ямар алдаа гаргадаг вэ? Яаж засах вэ?

## 7) Дасгал
- 3 хоосон зайтай өгүүлбэр (JP) + доор нь **Хариу** хэсэгт зөв хариуг бич.
`.trim();
}

function mnemonicPrompt(kanji: string) {
  return `
Чи ханз цээжлүүлэх coach. Доорх ханз дээр Монгол хэлээр **богино, хөгжилтэй, дүрслэлтэй mnemonic** өг.

**Ханз:** 「${kanji}」

### Заавар (заавал мөрдөнө)
- Хариултыг **Markdown** хэлбэрээр өг.
- Доорх гарчгуудыг яг энэ байдлаар **заавал** ашигла.

### Хариултын бүтэц (яг энэ дарааллаар)
# 「${kanji}」 ханз цээжлэх mnemonic

## 1) Утга
- Ханзын үндсэн утгыг 1 мөрөөр.

## 2) Дүрслэл (Visual hook)
- Ханзыг дүрсэлж холбох 1–2 мөрийн санаа.

## 3) Богино түүх
- 3–6 өгүүлбэртэй хөгжилтэй түүх.
- Түүх доторх гол холбоос үгийг **bold** болго.

## 4) Түлхүүр өгүүлбэр
- 1 өгүүлбэрээр “сануулах мөр” бич.

(Хэрвээ чи уншлагыг мэдэж байвал төгсгөлд нь:  
- Уншлага: on / kun гэж 1 мөрөөр нэм.)
`.trim();
}

/** ---- Generate helper with 1 retry ---- */
async function generateWithRetry(params: {
  prompt: string;
  validate: (text: string) => boolean;
  model?: string;
}) {
  const { prompt, validate, model = "gemini-3-flash-preview" } = params;

  const ai = createAI();

  // Attempt #1
  const r1 = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1200,
    },
  });

  let t1 = extractText(r1);
  if (!t1) {
    debugEmpty(r1);
    throw new Error("No response text returned from Gemini API");
  }
  if (validate(t1)) return t1;

  // Attempt #2 (repair / enforce structure)
  const repairPrompt = `
Дараах хариулт бүтэц дутуу/эмх цэгцгүй байна. Доорх **заасан бүтэц, гарчгуудыг яг** мөрдөж,
илүү ойлгомжтой, шат дараалалтай болгож **дахин бич**.

### Шаардлага
- Markdown формат
- Гарчиг бүрийг алгасахгүй
- Жишээ/дасгалыг бүрэн гүйцэд өг

### Анхны хариулт
${t1}
`.trim();

  const r2 = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: repairPrompt }] }],
    generationConfig: {
      temperature: 0.6,
      topP: 0.9,
      maxOutputTokens: 1400,
    },
  });

  const t2 = extractText(r2);
  if (!t2) {
    debugEmpty(r2);
    throw new Error("No response text returned from Gemini API (retry)");
  }

  // Even if not perfect, return retry result (better than failing)
  return t2;
}

/** ---- Public APIs ---- */
export const getGrammarExplanation = async (pattern: string): Promise<string> => {
  try {
    return await generateWithRetry({
      prompt: grammarPrompt(pattern),
      validate: looksLikeStructuredGrammar,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу.";
  }
};

export const getMnemonicStory = async (kanji: string): Promise<string> => {
  try {
    return await generateWithRetry({
      prompt: mnemonicPrompt(kanji),
      validate: looksLikeStructuredMnemonic,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Түүх олдсонгүй.";
  }
};
