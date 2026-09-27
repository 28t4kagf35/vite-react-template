// Minimal, dependency-free Sanity fetch.
//
// Runs client-side, in the visitor's browser, against Sanity's public
// read-only CDN API — no SDK, no build-time secret, nothing this repo's
// build step needs to know about. Editing the document in Sanity Studio
// and publishing is reflected here on next page load, with no rebuild.
//
// Scope for this proof: TEXT content comes from Sanity. Images now come
// from the R2 media pipeline (see lib/tvindefossen-images.ts) instead of
// the static files this repo used to ship in public/__mockup/images/ —
// making images CMS-editable too remains a deliberate next step, not done
// yet (that's a Sanity-asset-URL change, separate from this R2 pass).

import {
  buildStaticImage,
  HERO_WIDTHS,
  HEADON_WIDTHS,
  CLOSE_WIDTHS,
  CLOSE_SIZES,
} from "./lib/tvindefossen-images";

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

// Pre-baked, build-time-generated responsive variants served straight from
// R2 — replaces the local public/__mockup/images/ static files.
const heroImg = buildStaticImage("hero", HERO_WIDTHS);
const headonImg = buildStaticImage("headon", HEADON_WIDTHS);
const closeImg = buildStaticImage("close", CLOSE_WIDTHS, CLOSE_SIZES);

// Shape matches the crystallized component's own `CONTENT` interface,
// extended with srcSet/sizes so the <img> tags can go responsive without
// otherwise touching the 600+ lines of JSX.
export interface PageContent {
  name: string;
  tagline: string;
  heroImage: string;
  heroImageSrcSet: string;
  heroImageSizes: string;
  heroImagePosition: string;
  closeupPhoto: { src: string; srcSet: string; sizes: string; position: string };
  widePhoto: { src: string; srcSet: string; sizes: string; caption: string };
  lede: string;
  spiceActive: { label: string; pullQuote: string; body: string };
  experiential: string[];
  practicalBody: string;
  quickFacts: Array<{ label: string; sub: string }>;
  planDetails: Array<{ label: string; body: string }>;
  nextFall: {
    name: string;
    descriptor: string;
    hero: { src: string; srcSet: string; sizes: string; position: string };
  };
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
    heroImage: heroImg.src,
    heroImageSrcSet: heroImg.srcSet,
    heroImageSizes: heroImg.sizes,
    heroImagePosition: doc.heroImagePosition ?? "center 28%",
    closeupPhoto: {
      src: closeImg.src,
      srcSet: closeImg.srcSet,
      sizes: closeImg.sizes,
      position: doc.closeupPhoto?.position ?? "center 30%",
    },
    widePhoto: {
      src: headonImg.src,
      srcSet: headonImg.srcSet,
      sizes: headonImg.sizes,
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
        // The export borrows the Tvindefossen close-up as the next-fall
        // placeholder image — same as the Astro side.
        src: closeImg.src,
        srcSet: closeImg.srcSet,
        sizes: closeImg.sizes,
        position: doc.nextFall?.hero?.position ?? "center 40%",
      },
    },
    continueCards: doc.continueCards ?? { desktop: [], tablet: [], mobile: [] },
  };
}
