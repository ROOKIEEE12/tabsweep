export type Category = "GitHub" | "Docs" | "Video" | "Shopping" | "Social" | "Articles" | "Tools" | "Other";

export const CATEGORY_COLORS: Record<Category, chrome.tabGroups.ColorEnum> = {
  GitHub: "grey", Docs: "blue", Video: "red", Shopping: "yellow",
  Social: "pink", Articles: "green", Tools: "purple", Other: "cyan",
};

const RULES: [Category, RegExp][] = [
  ["GitHub", /(^|\.)(github\.com|gitlab\.com|bitbucket\.org)$/],
  ["Video", /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|twitch\.tv|netflix\.com)$/],
  ["Shopping", /(^|\.)(amazon\.[a-z.]+|flipkart\.com|myntra\.com|ebay\.com|aliexpress\.com|meesho\.com)$/],
  ["Social", /(^|\.)(twitter\.com|x\.com|linkedin\.com|reddit\.com|facebook\.com|instagram\.com|discord\.com)$/],
  ["Docs", /(^docs\.|^developer\.|^developers\.|^learn\.|(^|\.)(mozilla\.org|readthedocs\.io|nextjs\.org|react\.dev|typescriptlang\.org|stackoverflow\.com|devdocs\.io|w3schools\.com)$)/],
  ["Articles", /(^|\.)(medium\.com|dev\.to|substack\.com|hashnode\.dev|news\.ycombinator\.com|towardsdatascience\.com)$/],
  ["Tools", /(^|\.)(figma\.com|notion\.so|vercel\.com|supabase\.com|chatgpt\.com|claude\.ai|console\.[a-z.]+|localhost)$/],
];

export function categorize(url: string): Category {
  try {
    const host = new URL(url).hostname;
    for (const [cat, re] of RULES) if (re.test(host)) return cat;
  } catch { /* chrome:// etc */ }
  return "Other";
}
