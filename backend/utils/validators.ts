// Custom validators for user/project input, etc.

export function isValidEmail(email: string): boolean {
  return /^.+@.+\..+$/.test(email);
}

export function isNonEmpty(str: string): boolean {
  return typeof str === "string" && str.trim().length > 0;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isPositiveNumber(n: any): boolean {
  const num = Number(n);
  return !isNaN(num) && num > 0;
}