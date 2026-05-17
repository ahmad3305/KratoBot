// Minimalist logger utility

export function logInfo(...args: any[]) {
  // Add timestamps if you want
  console.log("[INFO]", ...args);
}

export function logError(...args: any[]) {
  console.error("[ERROR]", ...args);
}

export function logDebug(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[DEBUG]", ...args);
  }
}