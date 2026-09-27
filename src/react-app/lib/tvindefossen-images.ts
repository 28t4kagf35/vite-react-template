// R2-backed responsive image variants for the Tvindefossen page.
//
// Mirrors astro-blog-starter-template/src/lib/tvindefossen.ts's
// buildStaticImage() exactly, so the media-pipeline test is genuinely
// apples-to-apples between the two stacks: same bucket, same prefix, same
// widths, same WebP+JPEG-fallback strategy. Pre-baked at build/content time
// (not per-request) and served straight from R2's public dev URL.

export const R2_BASE = "https://pub-fd4b2549c703402ea7ec95adbd09f66d.r2.dev";

// NOTE: bucket objects were uploaded under the "tvinde-" prefix (not the
// full "tvindefossen-" slug) for this test round — matches the prefix the
// Astro side had to correct to. Update if the bucket is ever re-uploaded
// with the full slug (the naming convention we actually want going forward).
const R2_PREFIX = "tvinde";

export const HERO_WIDTHS = [640, 1080, 1600, 2400];
export const HEADON_WIDTHS = [640, 1080, 1600, 2000];
export const CLOSE_WIDTHS = [480, 800, 1200];
export const CLOSE_SIZES = "(min-width: 900px) 45vw, 100vw";

export type ImgSet = { src: string; srcSet: string; sizes: string };
export type Role = "hero" | "headon" | "close";

export function buildStaticImage(role: Role, widths: number[], sizes = "100vw"): ImgSet {
  const srcSet = widths.map((w) => `${R2_BASE}/${R2_PREFIX}-${role}-${w}.webp ${w}w`).join(", ");
  return {
    src: `${R2_BASE}/${R2_PREFIX}-${role}-${widths[widths.length - 1]}.jpg`,
    srcSet,
    sizes,
  };
}
