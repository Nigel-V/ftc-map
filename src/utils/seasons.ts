import { getCollection } from "astro:content";

export async function getLatestSeason() {
  const allSeasons = await getCollection("seasons");
  
  if (allSeasons.length === 0) return null;

  // Sort by ID (year) descending
  const sorted = allSeasons.sort((a, b) => Number(b.id) - Number(a.id));
  return sorted[0];
}

export function getCanonical(path: string, site: URL | undefined) {
  // SEO best practice: Always return absolute URLs if possible
  return site ? new URL(path, site).href : path;
}