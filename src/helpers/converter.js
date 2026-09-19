export const fmtRupee = (v) => {
  const n = Number(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

export const fmtNum = (v) => {
  const n = Number(v) || 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const qs = (year, month = 0) => `?year=${year}${month ? `&month=${month}` : ""}`;
