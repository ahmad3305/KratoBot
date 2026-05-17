import { scrapeWebsite } from "./scraping/webScraper";
import { extractKeywords } from "./ml/keyword_extractor";
import { analyzeSentiment } from "./ml/sentiment_analyzer";
import { cleanText } from "../utils/textCleaner";
import { ApifyClient } from "apify-client";
import { pool } from "../config/database";
import axios from "axios";

// Types
export type ProcessedSite = {
  domain: string;
  keywords: string[];
  sentimentScore: number;
  isBrand: boolean;
  competitor_id?: number; // for DB storage
};

export type AuthorityResult = {
  domain: string;
  keywords: string[];
  sentiment: number;
  backlinks: number;
  authority_score: number;
  isBrand: boolean;
  competitor_id?: number;
};

const APIFY_TOKEN =process.env.APIFY_API;
const MAX_DOMAIN_SCORE = 100;
const MAX_REF_DOMAINS = 100000;
const MAX_LINKS = 1000000;
const MAX_KEYWORDS = 50;

const LLM_API_URL = process.env.LLM_API_URL || "http://localhost:8001/generate_strategy_report";
const client = new ApifyClient({ token: APIFY_TOKEN });

// Utility functions
function normalize(val: number, max: number) {
  return Math.max(0, Math.min(val / (max || 1), 1));
}

function computeAuthority({
  domain_score,
  referring_domains_count,
  total_link_count,
  keyword_count,
  sentiment,
}: {
  domain_score: number;
  referring_domains_count: number;
  total_link_count: number;
  keyword_count: number;
  sentiment: number;
}): number {
  const normRefDomains = normalize(referring_domains_count, MAX_REF_DOMAINS);
  const normLinks = normalize(total_link_count, MAX_LINKS);
  const normDomainScore = normalize(domain_score, MAX_DOMAIN_SCORE);
  const normKeywords = normalize(keyword_count, MAX_KEYWORDS);
  const normSentiment = Math.max(0, Math.min(sentiment, 1));
  return (
    normRefDomains * 30 +
    normLinks * 20 +
    normDomainScore * 10 +
    normKeywords * 25 +
    normSentiment * 15
  );
}

// Fetch domain metrics via Apify
async function fetchMetrics(domain: string): Promise<{
  domain_score: number;
  referring_domains_count: number;
  total_link_count: number;
}> {
  const input = {
    domain,
    include_backlinks: false,
    timeout: 60,
  };
  const run = await client.actor("y7fDLFautapqoAg0v").call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const v = items[0] || {};
  return {
    domain_score: Number(v.domain_score) || 0,
    referring_domains_count: Number(v.referring_domains_count) || 0,
    total_link_count: Number(v.total_link_count) || 0,
  };
}

// Scrape, clean, ML extract for a domain
async function buildRawSite(domain: string, isBrand: boolean): Promise<{ text: string; domain: string; isBrand: boolean }> {
  const pages = await scrapeWebsite(`https://${domain}`, 15);
  const fullText = pages.map(p => p.text).join(" ").replace(/\s+/g, " ").trim();
  return {
    domain,
    isBrand,
    text: fullText.slice(0, 32000),
  };
}

async function prepareSite(site: { domain: string; isBrand: boolean; text: string }): Promise<ProcessedSite> {
  const cleaned = cleanText(site.text);
  const [keywords, sentimentScore] = await Promise.all([
    extractKeywords(cleaned),
    analyzeSentiment(cleaned),
  ]);
  return {
    domain: site.domain,
    keywords,
    sentimentScore,
    isBrand: site.isBrand,
  };
}

// Process and (for competitors) insert to analytics table
async function processSite(
  site: ProcessedSite,
  competitor_id?: number // Must pass for competitors
): Promise<AuthorityResult> {
  const { domain_score, referring_domains_count, total_link_count } = await fetchMetrics(site.domain);
  const authority_score = Number(
    computeAuthority({
      domain_score,
      referring_domains_count,
      total_link_count,
      keyword_count: site.keywords.length,
      sentiment: site.sentimentScore,
    }).toFixed(2)
  );

  if (competitor_id) {
    await pool.query(
      `INSERT INTO Competitor_Analytics 
        (competitor_id, backlink_count, authority_score, extracted_keywords, sentiment_score, analyzed_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
        backlink_count=VALUES(backlink_count),
        authority_score=VALUES(authority_score),
        extracted_keywords=VALUES(extracted_keywords),
        sentiment_score=VALUES(sentiment_score),
        analyzed_at=NOW()`,
      [
        competitor_id,
        total_link_count,
        authority_score,
        JSON.stringify(site.keywords),
        site.sentimentScore,
      ]
    );
  }

  return {
    domain: site.domain,
    keywords: site.keywords,
    sentiment: site.sentimentScore,
    backlinks: total_link_count,
    authority_score,
    isBrand: site.isBrand,
    competitor_id,
  };
}

// The main orchestrator function: USE THIS IN /api/analysis!
export async function runOrchestrator({
  project_id,
  report_id,
  brandDomain,
  brandCompetitorArr,
  report_title,
}: {
  project_id: number;
  report_id: number;
  brandDomain: string;
  brandCompetitorArr: { domain: string; competitor_id: number }[];
  report_title?: string;
}) {
  try {
    // 1. Scrape and ML enrich for brand
    const rawBrand = await buildRawSite(brandDomain, true);
    const brandProcessed = await prepareSite(rawBrand);

    // 2. Scrape and ML enrich for each competitor (and map to competitor_id)
    const rawComps = await Promise.all(
      brandCompetitorArr.map(c => buildRawSite(c.domain, false))
    );
    const processedComps = await Promise.all(
      rawComps.map((raw, i) => prepareSite(raw).then(site => ({ ...site, competitor_id: brandCompetitorArr[i].competitor_id })))
    );

    // 3. Compute authority + store analytics rows for competitors
    const competitorResults: AuthorityResult[] = [];
    for (const compSite of processedComps) {
      competitorResults.push(await processSite(compSite, compSite.competitor_id));
    }

    // 4. Compute for brand (do not write to competitor_analytics, but return info)
    const brandResult = await processSite(brandProcessed);

    // 5. Build LLM input (structure both brand & competitors as you designed in structuredData)
    const structuredData = {
      [brandDomain]: {
        ...brandResult,
        competitors: {} as Record<string, AuthorityResult>
      }
    };
    for (const compRes of competitorResults) {
      structuredData[brandDomain].competitors[compRes.domain] = compRes;
    }

    // 6. Call LLM to generate report content/strategy
    const { data: llmResp } = await axios.post(LLM_API_URL, { data: structuredData });
    const report_content: string = llmResp.strategy_report || llmResp.report || llmResp.text || "";

    // 7. Update Reports table
    await pool.query(
      `UPDATE Reports SET 
        report_title = ?, 
        report_content = ?,
        brand_authority_score = ?, 
        estimated_backlinks = ?, 
        extracted_keywords = ?, 
        sentiment_score = ?, 
        status = 'ready', 
        generated_at = NOW()
      WHERE report_id = ?`,
      [
        report_title || `Brand Analysis for ${brandDomain}`,
        report_content,
        brandResult.authority_score,
        brandResult.backlinks,
        JSON.stringify(brandResult.keywords),
        brandResult.sentiment,
        report_id,
      ]
    );
  } catch (err: any) {
    // Set report status to failed if anything goes wrong
    await pool.query(`UPDATE Reports SET status = 'failed' WHERE report_id = ?`, [report_id]);
  }
}