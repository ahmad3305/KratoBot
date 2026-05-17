import { ApifyClient } from 'apify-client';

export type ProcessedSite = {
  domain: string;
  keywords: string[];
  sentimentScore: number;
  isBrand: boolean;
};

export type AuthorityResult = {
  keywords: string[];
  sentiment: number;
  backlinks: number;
  authority_score: number;
  isBrand: boolean;
};

export type AuthorityStructuredOutput = {
  [brandDomain: string]: AuthorityResult & {
    competitors: { [domain: string]: AuthorityResult }
  }
};

const APIFY_TOKEN = process.env.APIFY_API;

const MAX_DOMAIN_SCORE = 100;
const MAX_REF_DOMAINS = 10000;
const MAX_LINKS = 1000000;
const MAX_KEYWORDS = 50;

// 30% referring domains, 20% link count, 10% domain score, 25% keyword count, 15% sentiment
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

const client = new ApifyClient({ token: APIFY_TOKEN });

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

  const run = await client.actor('y7fDLFautapqoAg0v').call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  const v = items[0] || {};
  return {
    domain_score: Number(v.domain_score) || 0,
    referring_domains_count: Number(v.referring_domains_count) || 0,
    total_link_count: Number(v.total_link_count) || 0,
  };
}

async function processSite(site: ProcessedSite): Promise<AuthorityResult> {
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
  return {
    keywords: site.keywords,
    sentiment: site.sentimentScore,
    backlinks: total_link_count,
    authority_score,
    isBrand: site.isBrand,
  };
}

export async function calculateAuthorityStructureFromArray(
  sites: ProcessedSite[]
): Promise<AuthorityStructuredOutput> {
  const brandSite = sites.find((s) => s.isBrand);
  if (!brandSite) throw new Error('No site has isBrand=true!');

  const competitorsArr = sites.filter((s) => !s.isBrand);

  const [brandResult, ...competitorResults] = await Promise.all([
    processSite(brandSite),
    ...competitorsArr.map(processSite),
  ]);

  // Attach competitors to brand node
  const competitorsObj: { [domain: string]: AuthorityResult } = {};
  competitorsArr.forEach((site, i) => {
    competitorsObj[site.domain] = competitorResults[i];
  });

  return {
    [brandSite.domain]: {
      ...brandResult,
      competitors: competitorsObj,
    },
  };
}