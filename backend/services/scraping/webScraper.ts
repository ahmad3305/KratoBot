import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

export async function scrapeWebsite(
  startUrl: string,
  maxPages = 10
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

      console.log(`Scraping: ${url}`);

      const response = await axios.get(url, {
        timeout: 15000,

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      const html = response.data;

      if (!html || typeof html !== "string") {
        console.log(`Empty HTML at ${url}`);
        continue;
      }

      const $ = cheerio.load(html);

      // remove useless sections
      $(
        "script, style, noscript, svg, nav, footer, header, form, iframe"
      ).remove();

      // extract visible text
      let text = $("body").text();

      text = text
        .replace(/\s+/g, " ")
        .replace(/[^\w\s.,!?-]/g, "")
        .trim();

      // filter garbage lines
      text = text
        .split(".")
        .filter(
          (line) =>
            line.trim().length > 30 &&
            !/(home|about|contact|login|signup|privacy|terms)/i.test(line)
        )
        .join(". ");

      console.log(`TEXT LENGTH: ${text.length}`);

      scraped.push({
        url,
        html,
        text,
      });

      // discover internal links
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

            if (
              !link.startsWith("mailto:") &&
              !link.includes("#")
            ) {
              queue.push(link);
            }
          }

        } catch {}
      });

    } catch (err: any) {

      console.log(`FAILED: ${url}`);

      if (err.response) {
        console.log("STATUS:", err.response.status);
      } else {
        console.log(err.message);
      }
    }
  }

  return scraped;
}
