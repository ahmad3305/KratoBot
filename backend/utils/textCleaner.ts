export function cleanText(input: string): string {
  return input
    // remove HTML first
    .replace(/<\/?[^>]+(>|$)/g, "")

    // split into lines for structural filtering
    .split("\n")
    .map(line => line.trim())

    // remove empty + boilerplate navigation lines
    .filter(line => {
      if (!line) return false;

      return !/(home|about|contact|login|signup|privacy|terms|cookies|subscribe|menu)/i.test(line);
    })

    // rejoin after filtering
    .join(" ")

    // remove URLs
    .replace(/https?:\/\/\S+/g, "")

    // remove emails
    .replace(/\S+@\S+\.\S+/g, "")

    // collapse whitespace
    .replace(/\s+/g, " ")

    // remove weird characters
    .replace(/[^\w\s.,!?-]/g, "")

    .trim();
}