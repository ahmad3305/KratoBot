// Cleans and normalizes website text for NLP/analysis

export function cleanText(input: string): string {
  return input
    .replace(/<\/?[^>]+(>|$)/g, "")     // Remove HTML tags
    .replace(/\s+/g, " ")               // Collapse whitespace
    .replace(/[^\w\s.,!?-]/g, "")       // Remove non-standard chars (except basic punctuation)
    .trim();
}