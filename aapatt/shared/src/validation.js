export function isValidCoordinates(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function sanitizeText(input) {
  if (!input) return "";
  return String(input).replace(/[\0\b\t\n\r\x1a\"\'\\]/g, " ").trim();
}
