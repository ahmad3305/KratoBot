// For KeyBERT keyword extraction
export interface KeywordExtractionRequest {
  text: string;
}

export interface KeywordExtractionResponse {
  keywords: string[];
}

// For DistilBERT sentiment analysis
export interface SentimentAnalysisRequest {
  text: string;
}

export interface SentimentAnalysisResponse {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
}

// For LLM (Strategy Generation)
export interface StrategyGenerationRequest {
  brand: any;
  competitors: any[];
}

export interface StrategyGenerationResponse {
  strategy_report: string;
}