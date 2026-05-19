import axios from "axios";

const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL ||
  "http://127.0.0.1:8001/analyze_sentiment";

/**
 * Returns sentiment score in range 0–1
 */
export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const res = await axios.post(SENTIMENT_API_URL, { text });

    const score = res.data?.score;

    if (typeof score !== "number") return 0.0;

    return score;
  } catch (err) {
    console.error("Sentiment API failed:", err);
    return 0.0;
  }
}