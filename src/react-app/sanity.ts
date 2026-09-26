// Minimal, dependency-free Sanity fetch.
//
// Runs client-side, in the visitor's browser, against Sanity's public
// read-only CDN API — no SDK, no build-time secret, nothing this repo's
// build step needs to know about. Editing the document in Sanity Studio
// and publishing is reflected here on next page load, with no rebuild.
//
// Scope for this proof: TEXT content comes from Sanity. Images stay as
// static files shipped in this repo's public/__mockup/images/ folder —
// making images CMS-editable too is a deliberate next step, not done yet.

const PROJECT_ID = "h6p17t07";
const DATASET = "production";
const API_VERSION = "2024-01-01";

const QUERY = `*[_type == "waterfall" && name == "Tvindefossen"][0]`;

interface SanityWaterfallDoc {
  _id: string;
  name: string;
  tagline: string;
  heroImagePosition?: string;
  closeupPhoto?: { position?: string };
  widePhoto?: { caption?: string };
  lede: string;
  spiceActive: { label: string; pullQuote: string; body: string };
  experiential: string[];
  practicalBody: string;
  quickFacts: Array<{ label: string; sub: string }>;
  planDetails: Array<{ label: string; body: string }>;
  nextFall?: { name: string; descriptor: string; hero?: { position?: string } };
  continueCards?: {
    desktop: Array<{ label: string; body: string }>;
    tablet: Array<{ label: string; body: string }>;
    mobile: Array<{ label: string; body: string }>;
  };
}

async function fetchTvindefossenDoc(): Promise<SanityWaterfallDoc> {
  const url = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(
    QUERY
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sanity fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.result) {
    throw new Error("Sanity returned no Tvindefossen document");
  }
  return json.result as SanityWaterfallDoc;
}

// Static image paths, shipped in this repo (public/__mockup/images/),
// carried over verbatim from the crystallized component's own CONTENT
// block. Not sourced from Sanity yet — see the note above.
const STATIC_IMAGES = {
  hero: "/__mockup/images/tvinde-hero-v2.jpg",
  closeup: "/__mockup/images/tvinde-close.jpg",
  wide: "/__mockup/images/tvinde-headon.jpg",
  nextFallHero: "/__mockup/images/tvinde-close.jpg",
};

// Shape matches the crystallized component's own `CONTENT` interface
// exactly, so the 600+ lines of JSX below don't need to change at all —
// only where this data comes from changes.
export interface PageContent {
  name: string;
  tagline: string;
  heroImage: string;
  heroImagePosition: string;
  closeupPhoto: { src: string; position: string };
  widePhoto: { src: string; caption: string };
  lede: string;
  spiceActive: { label: string; pullQuote: string; body: string };
  experiential: string[];
  practicalBody: string;
  quickFacts: Array<{ label: string; sub: string }>;
  planDetails: Array<{ label: string; body: string }>;
  nextFall: { name: string; descriptor: string; hero: { src: string; position: string } };
  continueCards: {
    desktop: Array<{ label: string; body: string }>;
    tablet: Array<{ label: string; body: string }>;
    mobile: Array<{ label: string; body: string }>;
  };
}

export async function fetchTvindefossenContent(): Promise<PageContent> {
  const doc = await fetchTvindefossenDoc();

  return {
    name: doc.name,
    tagline: doc.tagline,
    heroImage: STATIC_IMAGES.hero,
    heroImagePosition: doc.heroImagePosition ?? "center 28%",
    closeupPhoto: {
      src: STATIC_IMAGES.closeup,
      position: doc.closeupPhoto?.position ?? "center 30%",
    },
    widePhoto: {
      src: STATIC_IMAGES.wide,
      caption: doc.widePhoto?.caption ?? "",
    },
    lede: doc.lede,
    spiceActive: doc.spiceActive,
    experiential: doc.experiential,
    practicalBody: doc.practicalBody,
    quickFacts: doc.quickFacts,
    planDetails: doc.planDetails,
    nextFall: {
      name: doc.nextFall?.name ?? "",
      descriptor: doc.nextFall?.descriptor ?? "",
      hero: {
        src: STATIC_IMAGES.nextFallHero,
        position: doc.nextFall?.hero?.position ?? "center 40%",
      },
    },
    continueCards: doc.continueCards ?? { desktop: [], tablet: [], mobile: [] },
  };
}
