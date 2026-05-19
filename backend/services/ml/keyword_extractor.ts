import axios from "axios";

const KEYWORD_API_URL =
  process.env.KEYWORD_API_URL || "http://127.0.0.1:8001/extract_keywords";

export async function extractKeywords(
  text: string,
  numKeywords = 1000
): Promise<string[]> {
  try {
    const res = await axios.post(KEYWORD_API_URL, {
      text,
      num_keywords: numKeywords,
    });

    const keywords = res.data?.keywords;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return ["empty_no_keywords"];
    }

    return keywords;
  } catch (err) {
    console.error("Keyword API failed:", err);
    return ["empty_api_fail"];
  }
}