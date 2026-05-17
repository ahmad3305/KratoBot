// Usage: Call these before processing in each API handler

import { isValidEmail, isNonEmpty, isValidUrl, isPositiveNumber } from "../utils/validators";

export function validateRegister(body: any) {
  return isNonEmpty(body.full_name) &&
    isValidEmail(body.email) &&
    isNonEmpty(body.password);
}

export function validateLogin(body: any) {
  return isValidEmail(body.email) && isNonEmpty(body.password);
}

export function validateProject(body: any) {
  return (
    isNonEmpty(body.project_name) &&
    isValidUrl(body.brand_website)
  );
}