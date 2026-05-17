import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export async function scrapeWebsite(
  startUrl: string,
  maxPages = 15
): Promise<{ url: string; html: string; text: string }[]> {
  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const scraped: { url: string; html: string; text: string }[] = [];

  const startDomain = new URL(startUrl).hostname;

  while (queue.length && scraped.length < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const { data: html } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(html);

      // Extract visible text content
      const text = $("body").text().replace(/\s+/g, " ").trim();
      scraped.push({ url, html, text });

      // Find internal links and add new ones to the queue if not visited
      $("a[href]").each((_, el) => {
        let link = $(el).attr("href") || "";
        try {
          if (!link.startsWith("http")) {
            link = new URL(link, url).href;
          }
          const linkDomain = new URL(link).hostname;
          if (
            linkDomain === startDomain &&
            !visited.has(link) &&
            !queue.includes(link) &&
            link.startsWith("http")
          ) {
            if (!link.startsWith("mailto:") && !link.includes("#")) queue.push(link);
          }
        } catch {  }
      });
    } catch (err) {
    }
  }

  return scraped;
}