import axios from "axios";

const SENTIMENT_API_URL = process.env.SENTIMENT_API_URL || "http://localhost:8002/analyze_sentiment";

export async function analyzeSentiment(text: string) {
  const res = await axios.post(SENTIMENT_API_URL, { text });
  return res.data.result;
}