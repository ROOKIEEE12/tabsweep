export type Category =
  | "GitHub"
  | "AI"
  | "Video"
  | "Docs"
  | "Shopping"
  | "Social"
  | "News"
  | "Finance"
  | "Design"
  | "DevTools"
  | "Learning"
  | "Articles"
  | "Tools"
  | "Other";

export const CATEGORY_COLORS: Record<Category, chrome.tabGroups.ColorEnum> = {
  GitHub:   "grey",
  AI:       "purple",
  Video:    "red",
  Docs:     "blue",
  Shopping: "yellow",
  Social:   "pink",
  News:     "cyan",
  Finance:  "green",
  Design:   "orange",
  DevTools: "grey",
  Learning: "blue",
  Articles: "green",
  Tools:    "cyan",
  Other:    "grey",
};

// hostname → category map (exact match after stripping www.)
const HOST_MAP: Record<string, Category> = {
  // ── Code Hosting ──────────────────────────────────────────────────────────
  "github.com": "GitHub", "github.io": "GitHub", "github.dev": "GitHub",
  "gitlab.com": "GitHub", "bitbucket.org": "GitHub", "gitea.io": "GitHub",
  "codeberg.org": "GitHub", "sourcehub.io": "GitHub",

  // ── AI / LLMs / Chatbots ──────────────────────────────────────────────────
  "chatgpt.com": "AI", "chat.openai.com": "AI", "openai.com": "AI",
  "claude.ai": "AI", "anthropic.com": "AI",
  "perplexity.ai": "AI",
  "gemini.google.com": "AI", "bard.google.com": "AI",
  "copilot.microsoft.com": "AI",
  "you.com": "AI",
  "phind.com": "AI",
  "poe.com": "AI",
  "mistral.ai": "AI", "chat.mistral.ai": "AI",
  "groq.com": "AI",
  "huggingface.co": "AI",
  "cohere.com": "AI",
  "together.ai": "AI",
  "replicate.com": "AI",
  "stability.ai": "AI",
  "midjourney.com": "AI",
  "runway.ml": "AI",
  "elevenlabs.io": "AI",
  "suno.com": "AI", "suno.ai": "AI",
  "udio.com": "AI",
  "character.ai": "AI",
  "meta.ai": "AI",
  "deepseek.com": "AI",
  "kimi.moonshot.cn": "AI",
  "aistudio.google.com": "AI",
  "labs.google": "AI",

  // ── Video / Streaming ─────────────────────────────────────────────────────
  "youtube.com": "Video", "youtu.be": "Video", "youtube-nocookie.com": "Video",
  "vimeo.com": "Video",
  "twitch.tv": "Video",
  "netflix.com": "Video",
  "primevideo.com": "Video",
  "hotstar.com": "Video", "disneyplus.com": "Video",
  "jiocinema.com": "Video",
  "sonyliv.com": "Video",
  "zee5.com": "Video",
  "mxplayer.in": "Video",
  "dailymotion.com": "Video",
  "bilibili.com": "Video",
  "rumble.com": "Video",
  "odysee.com": "Video",
  "tiktok.com": "Video",
  "streamable.com": "Video",

  // ── Shopping / Food ───────────────────────────────────────────────────────
  "amazon.com": "Shopping", "amazon.in": "Shopping",
  "flipkart.com": "Shopping",
  "myntra.com": "Shopping",
  "meesho.com": "Shopping",
  "ajio.com": "Shopping",
  "nykaa.com": "Shopping",
  "snapdeal.com": "Shopping",
  "ebay.com": "Shopping", "ebay.in": "Shopping",
  "aliexpress.com": "Shopping",
  "shein.com": "Shopping",
  "temu.com": "Shopping",
  "etsy.com": "Shopping",
  "bigbasket.com": "Shopping",
  "blinkit.com": "Shopping",
  "swiggy.com": "Shopping",
  "zomato.com": "Shopping",
  "zepto.com": "Shopping",
  "dunzo.com": "Shopping",
  "shopify.com": "Shopping",

  // ── Finance / Investing ───────────────────────────────────────────────────
  "zerodha.com": "Finance",
  "groww.in": "Finance",
  "upstox.com": "Finance",
  "coinbase.com": "Finance",
  "binance.com": "Finance",
  "wazirx.com": "Finance",
  "coinswitch.co": "Finance",
  "angelone.in": "Finance",
  "etmoney.com": "Finance",
  "paytmmoney.com": "Finance",
  "moneycontrol.com": "Finance",
  "economictimes.com": "Finance",
  "investing.com": "Finance",
  "tradingview.com": "Finance",
  "nseindia.com": "Finance",
  "bseindia.com": "Finance",

  // ── Design / Creative ─────────────────────────────────────────────────────
  "figma.com": "Design",
  "canva.com": "Design",
  "dribbble.com": "Design",
  "behance.net": "Design",
  "framer.com": "Design",
  "webflow.com": "Design",
  "adobe.com": "Design",
  "sketch.com": "Design",
  "invisionapp.com": "Design",
  "zeplin.io": "Design",
  "spline.design": "Design",
  "rive.app": "Design",
  "lottiefiles.com": "Design",
  "unsplash.com": "Design",
  "pexels.com": "Design",
  "freepik.com": "Design",
  "iconify.design": "Design",

  // ── Social ────────────────────────────────────────────────────────────────
  "twitter.com": "Social", "x.com": "Social",
  "linkedin.com": "Social",
  "reddit.com": "Social",
  "facebook.com": "Social",
  "instagram.com": "Social",
  "threads.net": "Social",
  "discord.com": "Social", "discord.gg": "Social",
  "slack.com": "Social",
  "telegram.org": "Social", "web.telegram.org": "Social", "t.me": "Social",
  "whatsapp.com": "Social",
  "snapchat.com": "Social",
  "pinterest.com": "Social",
  "quora.com": "Social",
  "tumblr.com": "Social",
  "bsky.app": "Social", "blueskyweb.xyz": "Social",
  "mastodon.social": "Social",

  // ── News / Tech News ─────────────────────────────────────────────────────
  "bbc.com": "News", "bbc.co.uk": "News",
  "cnn.com": "News",
  "theguardian.com": "News",
  "nytimes.com": "News",
  "washingtonpost.com": "News",
  "reuters.com": "News",
  "bloomberg.com": "News",
  "forbes.com": "News",
  "techcrunch.com": "News",
  "theverge.com": "News",
  "wired.com": "News",
  "arstechnica.com": "News",
  "ndtv.com": "News",
  "timesofindia.com": "News",
  "hindustantimes.com": "News",
  "thehindu.com": "News",
  "indianexpress.com": "News",
  "livemint.com": "News",
  "businessstandard.com": "News",
  "news.ycombinator.com": "News",
  "producthunt.com": "News",
  "hackernews.com": "News",

  // ── Learning / Courses ────────────────────────────────────────────────────
  "udemy.com": "Learning",
  "coursera.org": "Learning",
  "edx.org": "Learning",
  "khanacademy.org": "Learning",
  "pluralsight.com": "Learning",
  "skillshare.com": "Learning",
  "brilliant.org": "Learning",
  "codecademy.com": "Learning",
  "freecodecamp.org": "Learning",
  "leetcode.com": "Learning",
  "hackerrank.com": "Learning",
  "codechef.com": "Learning",
  "codeforces.com": "Learning",
  "topcoder.com": "Learning",
  "kaggle.com": "Learning",
  "fast.ai": "Learning",
  "deeplearning.ai": "Learning",
  "scrimba.com": "Learning",
  "theodinproject.com": "Learning",
  "boot.dev": "Learning",
  "frontendmasters.com": "Learning",
  "egghead.io": "Learning",
  "laracasts.com": "Learning",

  // ── Docs / References ─────────────────────────────────────────────────────
  "developer.mozilla.org": "Docs", "mozilla.org": "Docs",
  "w3.org": "Docs", "w3schools.com": "Docs",
  "react.dev": "Docs",
  "vuejs.org": "Docs",
  "angular.io": "Docs",
  "svelte.dev": "Docs",
  "nextjs.org": "Docs",
  "typescriptlang.org": "Docs",
  "javascript.info": "Docs",
  "python.org": "Docs",
  "go.dev": "Docs",
  "rust-lang.org": "Docs",
  "kotlinlang.org": "Docs",
  "swift.org": "Docs",
  "cppreference.com": "Docs",
  "devdocs.io": "Docs",
  "readthedocs.io": "Docs",
  "geeksforgeeks.org": "Docs",
  "tutorialspoint.com": "Docs",
  "stackoverflow.com": "Docs",
  "stackexchange.com": "Docs",
  "superuser.com": "Docs",
  "askubuntu.com": "Docs",

  // ── Dev Tools / Infra ─────────────────────────────────────────────────────
  "vercel.com": "DevTools",
  "netlify.com": "DevTools",
  "railway.app": "DevTools",
  "render.com": "DevTools",
  "supabase.com": "DevTools",
  "firebase.google.com": "DevTools",
  "console.firebase.google.com": "DevTools",
  "aws.amazon.com": "DevTools", "console.aws.amazon.com": "DevTools",
  "cloud.google.com": "DevTools",
  "portal.azure.com": "DevTools",
  "heroku.com": "DevTools",
  "digitalocean.com": "DevTools",
  "cloudflare.com": "DevTools",
  "sentry.io": "DevTools",
  "datadog.com": "DevTools",
  "newrelic.com": "DevTools",
  "grafana.com": "DevTools",
  "postman.com": "DevTools",
  "insomnia.rest": "DevTools",
  "hoppscotch.io": "DevTools",
  "ngrok.com": "DevTools",
  "localhost": "DevTools",

  // ── Articles / Blogs ─────────────────────────────────────────────────────
  "medium.com": "Articles",
  "dev.to": "Articles",
  "substack.com": "Articles",
  "hashnode.dev": "Articles",
  "hashnode.com": "Articles",
  "towardsdatascience.com": "Articles",
  "hackernoon.com": "Articles",
  "css-tricks.com": "Articles",
  "smashingmagazine.com": "Articles",
  "alistapart.com": "Articles",
  "thenewstack.io": "Articles",
  "sitepoint.com": "Articles",

  // ── Productivity / Tools ──────────────────────────────────────────────────
  "notion.so": "Tools",
  "obsidian.md": "Tools",
  "roamresearch.com": "Tools",
  "logseq.com": "Tools",
  "craft.do": "Tools",
  "evernote.com": "Tools",
  "todoist.com": "Tools",
  "linear.app": "Tools",
  "trello.com": "Tools",
  "asana.com": "Tools",
  "clickup.com": "Tools",
  "airtable.com": "Tools",
  "monday.com": "Tools",
  "basecamp.com": "Tools",
  "calendar.google.com": "Tools",
  "meet.google.com": "Tools",
  "zoom.us": "Tools",
  "loom.com": "Tools",
  "cal.com": "Tools",
  "typeform.com": "Tools",
  "tally.so": "Tools",
  "miro.com": "Tools",
  "whimsical.com": "Tools",
  "excalidraw.com": "Tools",
  "diagrams.net": "Tools",
  "draw.io": "Tools",
  "drive.google.com": "Tools",
  "docs.google.com": "Tools",
  "sheets.google.com": "Tools",
  "slides.google.com": "Tools",
  "mail.google.com": "Tools",
  "outlook.com": "Tools",
  "office.com": "Tools",
  "dropbox.com": "Tools",
};

// Subdomain prefix patterns (checked if host-map misses)
const PREFIX_RULES: [Category, RegExp][] = [
  ["AI",       /^(chat|api)\.(openai|anthropic|mistral|deepseek)\.com$/],
  ["DevTools", /^(console|app|dashboard|portal|admin|api)\..+/],
  ["Docs",     /^(docs?|developer|developers?|api|reference|learn|wiki)\..+/],
  ["Learning", /^(learn|course|courses?|academy)\..+/],
];

export function categorize(url: string): Category {
  try {
    const raw = new URL(url).hostname.toLowerCase();
    const host = raw.replace(/^www\./, "");

    // 1. Exact host map lookup
    if (HOST_MAP[host]) return HOST_MAP[host];

    // 2. Check if any host-map key is a suffix (e.g. "bbc.co.uk" matches "bbc.co.uk")
    for (const [key, cat] of Object.entries(HOST_MAP)) {
      if (host === key || host.endsWith("." + key)) return cat;
    }

    // 3. Subdomain prefix rules
    for (const [cat, re] of PREFIX_RULES) {
      if (re.test(host)) return cat;
    }

  } catch { /* chrome://, about:// etc */ }
  return "Other";
}
