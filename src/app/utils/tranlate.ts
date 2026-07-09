import fetch from "node-fetch";

const GOOGLE_API_KEY =
  process.env.GOOGLE_API_KEY ||
  "AIzaSyCg_UOJCrabLO5GUXk0DCHl5YeYCKBosY8";

interface GoogleTranslateResponse {
  data: {
    translations: { translatedText: string }[];
  };
}

export const translateText = async (
  text: string | number,
  targetLang: string
): Promise<string> => {
  if (text === null || text === undefined) return "";
  if (targetLang === "default") return String(text);

  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

  // Always convert text to string before sending
  const body = { q: String(text), target: targetLang };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as GoogleTranslateResponse;

    if (data?.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    }

    return String(text); // fallback if no translation
  } catch (err) {
    console.error("Translation error:", err);
    return String(text); // fallback on error
  }
};
