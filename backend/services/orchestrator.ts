import fs from "fs";
import path from "path";
import axios from "axios";
import { pool } from "../config/database";
import { scrapeWebsite } from "./scraping/webScraper";
import { extractKeywords } from "./ml/keyword_extractor";
import { analyzeSentiment } from "./ml/sentiment_analyzer";
import { ApifyClient } from "apify-client";

export type ProcessedSite = {
  domain: string;
  keywords: string[];
  sentimentScore: number;
  isBrand: boolean;
  competitor_id?: number;
  wordCount?: number;
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

const APIFY_TOKEN = process.env.APIFY_API;
const LLM_API_URL =
  process.env.LLM_API_URL || "http://localhost:8001/generate_strategy_report";

const client = new ApifyClient({ token: APIFY_TOKEN });


const MAX_DOMAIN_SCORE = 100; 
const MAX_REF_DOMAINS = 100000; 
const MAX_LINKS = 1000000; 
const MAX_KEYWORDS = 500;
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


/* ---------------- SAFE SCRAPE ---------------- */

async function buildRawSite(domain: string, isBrand: boolean) {
  try {
    const pages = await scrapeWebsite(`https://${domain}`, 5);

    const fullText = pages
      .map((p) => p.text || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    console.log(
      `[SCRAPED] ${domain} | pages=${pages.length} | words=${wordCount}`
    );

    return {
      domain,
      isBrand,
      text: fullText,
      wordCount,
    };
  } catch (err) {
    console.error(`[SCRAPE FAILED] ${domain}`, err);

    return {
      domain,
      isBrand,
      text: "",
      wordCount: 0,
    };
  }
}

/* ---------------- ML PIPELINE ---------------- */

async function prepareSite(site: {
  domain: string;
  isBrand: boolean;
  text: string;
  wordCount?: number;
}): Promise<ProcessedSite> {
  const wordCount = site.wordCount || site.text.split(/\s+/).length;

  console.log(`[ML INPUT] ${site.domain} | words=${wordCount}`);

  if (!site.text || site.text.length < 100) {
    console.warn(`[SKIP ML] ${site.domain} (insufficient text)`);
    return {
      domain: site.domain,
      keywords: ["empty_text"],
      sentimentScore: 0,
      isBrand: site.isBrand,
      wordCount,
    };
  }

  try {
    const [keywords, sentiment] = await Promise.all([
      extractKeywords(site.text),
      analyzeSentiment(site.text),
    ]);

    return {
      domain: site.domain,
      keywords: Array.isArray(keywords) ? keywords : ["empty_api_fail"],
      sentimentScore: typeof sentiment === "number" ? sentiment : 0,
      isBrand: site.isBrand,
      wordCount,
    };
  } catch (err) {
    console.error(`[ML FAILED] ${site.domain}`, err);

    return {
      domain: site.domain,
      keywords: ["ml_failed"],
      sentimentScore: 0,
      isBrand: site.isBrand,
      wordCount,
    };
  }
}

/* ---------------- ORCHESTRATOR ---------------- */

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
    console.log(`[ORCH START] report=${report_id}`);

    /* ---------------- BRAND ---------------- */

    const rawBrand = await buildRawSite(brandDomain, true);
    const brandProcessed = await prepareSite(rawBrand);

    /* ---------------- COMPETITORS (PARALLEL SAFE) ---------------- */

    const rawComps = await Promise.all(
      brandCompetitorArr.map((c) => buildRawSite(c.domain, false))
    );

    const processedComps = await Promise.all(
      rawComps.map((raw, i) =>
        prepareSite(raw).then((site) => ({
          ...site,
          competitor_id: brandCompetitorArr[i].competitor_id,
        }))
      )
    );

    /* ---------------- APIFY + AUTHORITY ---------------- */

    const processSite = async (site: ProcessedSite) => {
      const metrics = await fetchMetrics(site.domain);

      const authority_score = computeAuthority({
        domain_score: metrics.domain_score,
        referring_domains_count: metrics.referring_domains_count,
        total_link_count: metrics.total_link_count,
        keyword_count: site.keywords.length,
        sentiment: site.sentimentScore,
      });

      return {
        domain: site.domain,
        keywords: site.keywords,
        sentiment: site.sentimentScore,
        backlinks: metrics.total_link_count,
        authority_score: Number(authority_score.toFixed(2)),
        isBrand: site.isBrand,
        competitor_id: site.competitor_id,
      };
    };

    const competitorResults: AuthorityResult[] = [];

    for (const comp of processedComps) {
      try {
        const result = await processSite(comp);

        competitorResults.push(result);

        if (comp.competitor_id) {
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
              comp.competitor_id,
              result.backlinks,
              result.authority_score,
              JSON.stringify(result.keywords),
              result.sentiment,
            ]
          );
        }
      } catch (err) {
        console.error(`[COMPETITOR FAILED] ${comp.domain}`, err);
      }
    }

    const brandResult = await processSite(brandProcessed);

    /* ---------------- LLM ---------------- */

    const structuredData = {
      brand: {
        brand_domain: brandDomain,
        ...brandResult,
      },
      competitors: competitorResults.map((c) => ({
        domain: c.domain,
        keywords: c.keywords,
        sentiment: c.sentiment,
        backlinks: c.backlinks,
        authority_score: c.authority_score,
      })),
    };

    console.log("[LLM INPUT READY]");

    const { data: llmResp } = await axios.post(LLM_API_URL, {
      data: structuredData,
    });

    const report_content =
      llmResp.strategy_report || llmResp.report || llmResp.text || "";

    /* ---------------- DB UPDATE ---------------- */

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
        report_title || `Marketing Strategy for ${brandDomain}`,
        report_content,
        brandResult.authority_score,
        brandResult.backlinks,
        JSON.stringify(brandResult.keywords),
        brandResult.sentiment,
        report_id,
      ]
    );

    console.log(`[ORCH DONE] report=${report_id}`);
  } catch (err: any) {
    console.error("[ORCH FAILED]", err);

    await pool.query(
      `UPDATE Reports SET status = 'failed' WHERE report_id = ?`,
      [report_id]
    );
  }
}
