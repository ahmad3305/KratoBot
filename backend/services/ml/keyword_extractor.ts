import axios from "axios";

const KEYWORD_API_URL = process.env.KEYWORD_API_URL || "http://localhost:8001/extract_keywords";

export async function extractKeywords(text: string, numKeywords = 500): Promise<string[]> {
  const res = await axios.post(KEYWORD_API_URL, {
    text,
    num_keywords: numKeywords,
  });
  return res.data.keywords;
}