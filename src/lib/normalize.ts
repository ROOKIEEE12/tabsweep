const TRACKING = /^(utm_|fbclid|gclid|mc_|ref$|ref_src)/i;

/** Canonical key for duplicate detection: no hash, tracking params, www, trailing slash. */
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return raw;
    const params = [...u.searchParams.entries()]
      .filter(([k]) => !TRACKING.test(k))
      .sort(([a], [b]) => a.localeCompare(b));
    const qs = params.map(([k, v]) => `${k}=${v}`).join("&");
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path}${qs ? "?" + qs : ""}`;
  } catch {
    return raw;
  }
}
