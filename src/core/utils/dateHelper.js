export function normalizeToUtc(dateInput) {
  if (!dateInput) return new Date();
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default {
  normalizeToUtc,
};
