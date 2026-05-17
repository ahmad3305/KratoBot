from fastapi import FastAPI
from pydantic import BaseModel

# --- Keyword Extraction ---
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer

# --- Sentiment ---
from transformers import pipeline

# --- LLM (Gemini) ---
import google.generativeai as genai

app = FastAPI()

# Keyword extraction models
embedder = SentenceTransformer("all-MiniLM-L6-v2")
keyword_model = KeyBERT(model=embedder)

# Sentiment models
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# LLM (Gemini)
GEMINI_API_KEY = "your-key-here"  # Use env variable in prod!
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ------------------------------
# ----- SCHEMA CLASSES ---------
# ------------------------------

class KeywordRequest(BaseModel):
    text: str
    num_keywords: int = 500

class SentimentRequest(BaseModel):
    text: str

class ReportRequest(BaseModel):
    data: dict

# ------------------------------
# ---- ENDPOINTS ---------------
# ------------------------------

@app.post("/extract_keywords")
def extract_keywords(req: KeywordRequest):
    keywords = keyword_model.extract_keywords(req.text, top_n=req.num_keywords)
    return {"keywords": [kw for kw, _ in keywords]}

@app.post("/analyze_sentiment")
def analyze_sentiment(req: SentimentRequest):
    result = sentiment_model(req.text)
    return {"result": result}

@app.post("/generate_strategy_report")
def generate_strategy_report(req: ReportRequest):
    prompt = f"""
Analyze the following SEO and competitor data for a website.

Tasks:
1. Compare authority scores of brand and competitors
2. Identify strongest competitors
3. Estimate backlinks needed to compete
4. Suggest SEO strategy (3–4 bullet points, specific)
5. Suggest content strategy (3–4 bullet points, specific)
6. Suggest backlink building strategy (3–4 bullet points)
7. Suggest social media plan
8. Suggest Google Ads campaigns

and must Return a markdown text for the whole report, proper 

DATA (JSON):
{req.data}
"""
    response = gemini_model.generate_content(prompt)
    return {"strategy_report": response.text}