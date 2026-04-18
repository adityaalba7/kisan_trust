/**
 * Translation Service
 * 
 * Translates treatment plans to regional Indian languages.
 * 
 * Supports two backends:
 *   1. Bhashini API (Government of India) — set BHASHINI_API_KEY and BHASHINI_USER_ID
 *   2. Google Translate (free library) — works out of the box, no key needed
 * 
 * Currently uses a simple dictionary-based approach for common terms
 * and Google's free translate endpoint as fallback.
 */

const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

// Language codes
const LANGUAGE_CODES = {
    hindi: "hi",
    marathi: "mr",
    tamil: "ta",
    telugu: "te",
    kannada: "kn",
    bengali: "bn",
    punjabi: "pa",
    gujarati: "gu",
    odia: "or",
    malayalam: "ml",
    english: "en",
};

/**
 * Translate text to a target language.
 * @param {string} text - Text to translate (in English)
 * @param {string} targetLang - Language name ("hindi", "marathi", etc.) or code ("hi", "mr")
 * @returns {Object} { translatedText, language, method }
 */
export async function translateText(text, targetLang) {
    if (!text || !targetLang) {
        return { translatedText: text, language: "english", method: "none" };
    }

    // Resolve language code
    const langCode = LANGUAGE_CODES[targetLang.toLowerCase()] || targetLang.toLowerCase();

    if (langCode === "en") {
        return { translatedText: text, language: "english", method: "none" };
    }

    // Try Bhashini first (if configured)
    const bhashiniKey = process.env.BHASHINI_API_KEY;
    if (bhashiniKey) {
        try {
            const result = await translateWithBhashini(text, langCode);
            if (result) return { translatedText: result, language: targetLang, method: "bhashini" };
        } catch (error) {
            console.error("Bhashini error, falling back:", error.message);
        }
    }

    // Fallback: Google Translate free endpoint
    try {
        const result = await translateWithGoogle(text, langCode);
        if (result) return { translatedText: result, language: targetLang, method: "google" };
    } catch (error) {
        console.error("Google Translate error:", error.message);
    }

    // Final fallback: return original English text
    return { translatedText: text, language: "english", method: "fallback" };
}

/**
 * Bhashini API translation (Government of India)
 * Free for Indian developers — supports all major Indian languages.
 */
async function translateWithBhashini(text, targetLangCode) {
    const apiKey = process.env.BHASHINI_API_KEY;
    const userId = process.env.BHASHINI_USER_ID;

    if (!apiKey || !userId) return null;

    const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": apiKey,
            "userID": userId,
        },
        body: JSON.stringify({
            pipelineTasks: [{
                taskType: "translation",
                config: {
                    language: {
                        sourceLanguage: "en",
                        targetLanguage: targetLangCode,
                    },
                },
            }],
            inputData: {
                input: [{ source: text }],
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Bhashini API returned ${response.status}`);
    }

    const data = await response.json();
    return data?.pipelineResponse?.[0]?.output?.[0]?.target || null;
}

/**
 * Google Translate free endpoint.
 * No API key needed — uses the free translation endpoint.
 * Rate-limited but works well for hackathons.
 */
async function translateWithGoogle(text, targetLangCode) {
    // Split long text into chunks (Google free endpoint has limits)
    const maxLength = 4000;
    if (text.length > maxLength) {
        const chunks = splitText(text, maxLength);
        const results = [];
        for (const chunk of chunks) {
            const translated = await googleTranslateChunk(chunk, targetLangCode);
            results.push(translated);
        }
        return results.join(" ");
    }

    return googleTranslateChunk(text, targetLangCode);
}

async function googleTranslateChunk(text, targetLangCode) {
    const params = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: targetLangCode,
        dt: "t",
        q: text,
    });

    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`Google Translate returned ${response.status}`);
    }

    const data = await response.json();

    // Response format: [[["translated text", "original text", ...]]]
    if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map(item => item[0]).join("");
    }

    return null;
}

function splitText(text, maxLength) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks = [];
    let current = "";

    for (const sentence of sentences) {
        if ((current + sentence).length > maxLength) {
            if (current) chunks.push(current.trim());
            current = sentence;
        } else {
            current += " " + sentence;
        }
    }
    if (current) chunks.push(current.trim());
    return chunks;
}

/**
 * Get list of supported languages.
 */
export function getSupportedLanguages() {
    return Object.keys(LANGUAGE_CODES);
}
