export function normalizeVatNumber(input) {
  const raw = String(input || "").trim().toUpperCase();

  if (!raw) return "";

  let normalized = raw
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/-/g, "");

  if (/^\d{10}$/.test(normalized)) {
    normalized = `BE${normalized}`;
  }

  if (/^BE\d{10}$/.test(normalized)) {
    return normalized;
  }

  return normalized;
}

export function isValidNormalizedBelgianVat(vat) {
  return /^BE\d{10}$/.test(String(vat || ""));
}