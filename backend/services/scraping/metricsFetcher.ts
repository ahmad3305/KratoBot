import axios from "axios";

const SERPAPI_KEY = process.env.SERPAPI_KEY!;

async function serpTotalResults(query: string): Promise<number> {
  const res = await axios.get("https://serpapi.com/search.json", {
    params: {
      engine: "google",
      q: query,
      api_key: SERPAPI_KEY,
      hl: "en",
      gl: "us",
    },
    timeout: 15000,
  });
  return res.data?.search_information?.total_results ?? 0;
}

export async function estimateDomainBacklinks(domain: string) {
  const backlinksResults = await serpTotalResults(`"${domain}"`);
  const indexedResults = await serpTotalResults(`site:${domain}`);
  const backlinksEstimate = Math.max(backlinksResults - indexedResults, 0);

  return {
    domain,
    estimatedBacklinks: backlinksEstimate,
  };
}