/**
 * component.tsx — VossWaterfalls.no · Tvindefossen detail page
 *
 * Derived from: DT_Tvindefossen_final.tsx (canon canvas source)
 * Export date:  2026-08-15
 * Protocol:     EP-1.0 V4.2
 *
 * Transforms applied to canon source:
 *   1. Brand imports inlined — @/lib/brand replaced with literal constants
 *   2. useAmbientAudio inlined — no external hook file dependency
 *   3. SeasonalFlow inlined from WaterfallExtras.tsx (with MONTHS_DEFAULT)
 *   4. WaterfallMap stubbed — Mapbox replaced with static coordinate display
 *   5. Font-loading no-op replaced with a rendered brand font link
 *   6. backdropFilter stripped — both blur-reveal overlay and audio button (COMPAT-2)
 *   7. data-bb-field and data-bb-meta annotations retained verbatim
 *   8. interface CONTENT retained verbatim from canvas source
 */

import React, { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

// ── Inlined brand constants ──────────────────────────────────────────────────

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;1,8..60,300" +
  "&family=Source+Sans+3:wght@300;400" +
  "&family=IBM+Plex+Mono:wght@400" +
  "&family=Raleway:wght@300;400" +
  "&display=block";

const FONT_SS4  = "'Source Serif 4', Georgia, serif";
const SS3       = "'Source Sans 3', system-ui, sans-serif";
const MONO      = "'IBM Plex Mono', monospace";
const FONT_LBL  = "'Raleway', system-ui, sans-serif";

const SS4_SMOOTHING: CSSProperties = {
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const T_PAGE_TITLE: CSSProperties = {
  fontFamily: FONT_SS4, fontSize: "3.8rem", fontWeight: 300, fontStyle: "italic",
  fontVariationSettings: '"opsz" 36, "wght" 300', lineHeight: 1.06, letterSpacing: "-0.01em",
};

const T_PULL_QUOTE: CSSProperties = {
  fontFamily: FONT_SS4, fontSize: "1.22rem", fontWeight: 300, fontStyle: "italic",
  fontVariationSettings: '"opsz" 11, "wght" 300', lineHeight: 1.60, letterSpacing: "0.012em",
};

const T_SUB_QUOTE: CSSProperties = {
  fontFamily: FONT_SS4, fontSize: "1.08rem", fontWeight: 300, fontStyle: "italic",
  fontVariationSettings: '"opsz" 11, "wght" 300', lineHeight: 1.60, letterSpacing: "0.01em",
};

const T_BODY_FUNCTIONAL: CSSProperties = {
  fontFamily: SS3, fontSize: "1rem", fontWeight: 300,
  fontStyle: "normal", lineHeight: 1.82, letterSpacing: "0.02em",
};

const T_BODY_SMALL: CSSProperties = {
  fontFamily: SS3, fontSize: "0.88rem", fontWeight: 300,
  fontStyle: "normal", lineHeight: 1.70, letterSpacing: "0.01em",
};

const T_TAGLINE: CSSProperties = {
  fontFamily: FONT_LBL, fontSize: "1.06rem", fontWeight: 400,
  letterSpacing: "0.13em", textTransform: "uppercase" as const, lineHeight: 1.4,
};

const T_SECTION_LABEL: CSSProperties = {
  fontFamily: FONT_LBL, fontSize: "0.76rem", fontWeight: 400,
  letterSpacing: "0.14em", textTransform: "uppercase" as const, lineHeight: 1.6,
};

const T_CARD_LABEL: CSSProperties = {
  fontFamily: FONT_LBL, fontSize: "0.72rem", fontWeight: 400,
  letterSpacing: "0.14em", textTransform: "uppercase" as const, lineHeight: 1.6,
};

const T_MONO_DATA: CSSProperties = {
  fontFamily: MONO, fontSize: "0.82rem", fontWeight: 400,
  lineHeight: 1.60, letterSpacing: "0.06em",
};

const T_MONO_CAPTION: CSSProperties = {
  fontFamily: MONO, fontSize: "0.68rem", fontWeight: 400,
  letterSpacing: "0.14em", textTransform: "uppercase" as const, lineHeight: 1.50,
};

const T_MONO_TINY: CSSProperties = {
  fontFamily: MONO, fontSize: "0.58rem", fontWeight: 400,
  letterSpacing: "0.18em", textTransform: "uppercase" as const, lineHeight: 1.40,
};

const T_SCALE_DISPLAY = {
  pageTitle:    { desktop: "3.8rem", tablet: "3.2rem", mobile: "2.6rem" },
  sectionTitle: { desktop: "2.4rem", tablet: "2.0rem", mobile: "1.7rem" },
} as const;

const T_SCALE_BODY = { desktop: "1rem", mobile: "0.95rem" } as const;

const T_SCALE_TEXT = {
  pullQuote: { desktop: "1.22rem", tablet: "1.18rem", mobile: "1.08rem" },
  subQuote:  { desktop: "1.08rem", tablet: "1.04rem", mobile: "1.0rem"  },
} as const;

const DARK = {
  bg:      "#1A1714",
  surface: "#222120",
  rule:    "#2C2A28",
  muted:   "#6E6A65",
  body:    "#C4BEB4",
  head:    "#EDE9E2",
  bq:      "#7A8B74",
  accent:  "#D43535",
} as const;

const LIGHT = {
  bg:      "#F4F2EE",
  surface: "#EBE7DF",
  rule:    "#D6D2CB",
  muted:   "#8E8A84",
  body:    "#201E18",
  head:    "#111010",
  bq:      "#A4AE9C",
  accent:  "#D43535",
} as const;

type ColorTokens = typeof DARK;

// ── Inlined useAmbientAudio ──────────────────────────────────────────────────

type AudioState = "idle" | "playing" | "muted";

const TARGET_VOL = 0.09;
const FADE_IN_MS = 2500;
const FADE_OUT_MS = 1200;

function rampVolume(
  v: HTMLVideoElement,
  from: number,
  to: number,
  ms: number,
  isCurrent: () => boolean,
  done: () => void,
) {
  const start = performance.now();
  v.volume = from;
  const tick = () => {
    if (!isCurrent()) return;
    const t = Math.min((performance.now() - start) / ms, 1);
    v.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(tick);
    else done();
  };
  requestAnimationFrame(tick);
}

function useAmbientAudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const stateRef = useRef<AudioState>("idle");
  const fadeRef = useRef(0);

  const setState = (s: AudioState) => { stateRef.current = s; setAudioState(s); };

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.volume = 0;
      v.muted = true;
    }
  }, []);

  const onScroll = (el: HTMLElement) => {
    const v = videoRef.current;
    if (!v || stateRef.current !== "playing") return;
    const pct = Math.min(el.scrollTop / (el.scrollHeight - el.clientHeight), 1);
    v.volume = TARGET_VOL + pct * 0.18;
  };

  const toggle = () => {
    const v = videoRef.current; if (!v) return;
    if (stateRef.current === "idle") {
      const fade = ++fadeRef.current;
      v.volume = 0;
      v.muted = false;
      const playResult = v.paused ? v.play() : Promise.resolve();
      playResult.then(() => {
        if (fade !== fadeRef.current) return;
        rampVolume(v, 0, TARGET_VOL, FADE_IN_MS, () => fade === fadeRef.current, () => {});
        setState("playing");
      }).catch(() => {
        if (fade !== fadeRef.current) return;
        v.muted = true;
        setState("idle");
      });
    } else if (stateRef.current === "playing") {
      const fade = ++fadeRef.current;
      rampVolume(v, v.volume, 0, FADE_OUT_MS, () => fade === fadeRef.current, () => {
        if (fade !== fadeRef.current) return;
        v.muted = true;
        setState("muted");
      });
    } else if (stateRef.current === "muted") {
      const fade = ++fadeRef.current;
      v.muted = false; setState("playing");
      rampVolume(v, 0, TARGET_VOL, FADE_IN_MS, () => fade === fadeRef.current, () => {});
    }
  };

  return { videoRef, audioState, toggle, onScroll };
}

// ── Inlined SeasonalFlow (from WaterfallExtras.tsx) ─────────────────────────

type MonthFlow = { month: string; label: string; value: number };

const MONTHS_DEFAULT: MonthFlow[] = [
  { month: "January",   label: "J", value: 4 },
  { month: "February",  label: "F", value: 3 },
  { month: "March",     label: "M", value: 5 },
  { month: "April",     label: "A", value: 9 },
  { month: "May",       label: "M", value: 10 },
  { month: "June",      label: "J", value: 8 },
  { month: "July",      label: "J", value: 6 },
  { month: "August",    label: "A", value: 4 },
  { month: "September", label: "S", value: 6 },
  { month: "October",   label: "O", value: 8 },
  { month: "November",  label: "N", value: 7 },
  { month: "December",  label: "D", value: 5 },
];

function SeasonalFlow({
  maxBarH = 40, months, labelColor = "#ffffff", barColor = "#ffffff",
  labelSize = "0.52rem", monthSize = "0.42rem",
}: {
  maxBarH?: number; months?: MonthFlow[]; labelColor?: string;
  barColor?: string; labelSize?: string; monthSize?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t); }, []);
  const data = months ?? MONTHS_DEFAULT;
  return (
    <div>
      <p style={{ margin: "0 0 0.8rem", fontSize: labelSize, color: labelColor, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: SS3 }}>Flow · season</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: maxBarH + 18, width: "100%" }}>
        {data.map(({ label, value }, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", height: ready ? Math.round((value / 10) * maxBarH) : 2, background: barColor, opacity: value >= 9 ? 0.72 : value >= 6 ? 0.42 : 0.20, borderRadius: "2px 2px 0 0", transition: `height ${0.4 + i * 0.04}s ease-out ${i * 0.03}s` }} />
            <p style={{ margin: 0, fontSize: monthSize, color: labelColor, letterSpacing: "0.02em", fontFamily: "sans-serif" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WaterfallMap stub ────────────────────────────────────────────────────────
// Mapbox replaced with a static coordinate display for export bundle.
// CMS integrates the live map at build time using lng/lat from content-schema.

function WaterfallMap({ lng, lat, label, height, markerColor, mutedColor }: {
  lng: number; lat: number; label: string;
  bounds?: [number, number, number, number];
  nearbyLng?: number; nearbyLat?: number; nearbyLabel?: string;
  height?: number; markerColor?: string; mutedColor?: string;
}) {
  return (
    <div style={{ width: "100%", height: height ?? 200, background: "#1E1D1B", borderRadius: "0.3rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.4rem", boxSizing: "border-box", border: "1px solid #2C2A28" }}>
      <div>
        <p style={{ margin: "0 0 0.3rem", ...T_MONO_CAPTION, color: markerColor ?? "#EDE9E2" }}>{label}</p>
        <p style={{ margin: 0, ...T_MONO_TINY, color: mutedColor ?? "#6E6A65" }}>{lat.toFixed(6)}° N · {lng.toFixed(6)}° E</p>
      </div>
      <p style={{ margin: 0, ...T_MONO_TINY, color: mutedColor ?? "#6E6A65" }}>map · cms</p>
    </div>
  );
}

// ── CONTENT ───────────────────────────────────────────────────────────────
// Was a hardcoded literal in the canon canvas source. Now fetched live from
// Sanity (see ../sanity.ts) so the CMS, not this file, is the editable
// source of truth for text. Images stay static for this proof — see
// sanity.ts's note. Shape (PageContent) is identical to the original
// literal's shape, so nothing below this point had to change.

import { fetchTvindefossenContent, type PageContent } from "../sanity";

function useBreakpoint() {
  const get = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    return w >= 1024 ? "desktop" : w >= 600 ? "tablet" : "mobile";
  };
  const [bp, setBp] = useState<"desktop" | "tablet" | "mobile">(get);
  const observedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = () => setBp(get());
    const el = observedRef.current;
    if (!el) return;
    const observer = new ResizeObserver(h);
    observer.observe(el);
    h();
    return () => observer.disconnect();
  }, []);
  return { bp, observedRef };
}

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, sv] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sv(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible: v };
}
function Fade({ children, duration = 1.4 }: { children: React.ReactNode; duration?: number }) {
  const { ref, visible } = useFadeIn();
  return <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(0.7rem)", transition: `opacity ${duration}s ease, transform ${duration}s ease` }}>{children}</div>;
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return <p style={{ margin: "0 0 1.6rem", ...T_SECTION_LABEL, color }}>{children}</p>;
}
function CardLabel({ children, muted, size }: { children: React.ReactNode; muted: string; size?: string }) {
  return <p style={{ margin: "0 0 0.7rem", ...T_CARD_LABEL, ...(size ? { fontSize: size } : {}), color: muted }}>{children}</p>;
}

interface WaterfallPageProps {
  isDark?: boolean;
  registerAudioToggle?: (toggle: () => void) => void;
  onAudioStateChange?: (playing: boolean) => void;
}

export function TvindefossenFinal({
  isDark: isDarkProp,
  registerAudioToggle,
  onAudioStateChange,
}: WaterfallPageProps = {}) {
  const { bp, observedRef } = useBreakpoint();
  const [isDarkInt] = useState(true);
  const isDark = isDarkProp !== undefined ? isDarkProp : isDarkInt;
  const tk = isDark ? DARK : LIGHT;
  const containerRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const [CONTENT, setCONTENT] = useState<PageContent | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchTvindefossenContent()
      .then((c) => { if (!cancelled) setCONTENT(c); })
      .catch((err) => { if (!cancelled) setContentError(String(err)); });
    return () => { cancelled = true; };
  }, []);

  useLoadBrandFonts();

  const [cleared, setCleared] = useState(false);
  useEffect(() => { requestAnimationFrame(() => requestAnimationFrame(() => setCleared(true))); }, []);
  const [textVisible, setTextVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setTextVisible(true), 400); return () => clearTimeout(t); }, []);

  const { videoRef, audioState, toggle: handleAudioClick, onScroll } = useAmbientAudio();

  useEffect(() => { registerAudioToggle?.(handleAudioClick); }, [handleAudioClick, registerAudioToggle]);
  useEffect(() => { onAudioStateChange?.(audioState === "playing"); }, [audioState, onAudioStateChange]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const h = () => onScroll(el);
    el.addEventListener("scroll", h, { passive: true }); return () => el.removeEventListener("scroll", h);
  }, [onScroll]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isDesktop = bp === "desktop";

  const PAD = isMobile ? "0 1.25rem" : isTablet ? "0 1.4rem" : "0 1rem";
  const COL = isDesktop ? "860px" : "100%";
  const SEC = isMobile ? "3.5rem" : isTablet ? "4.5rem" : "5.5rem";
  const h1Size = isMobile ? T_SCALE_DISPLAY.pageTitle.mobile
               : isTablet ? T_SCALE_DISPLAY.pageTitle.tablet
               : T_SCALE_DISPLAY.pageTitle.desktop;

  if (contentError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1714", color: "#EDE9E2", fontFamily: SS3, padding: "2rem", textAlign: "center" }}>
        Could not load Tvindefossen from Sanity: {contentError}
      </div>
    );
  }

  if (!CONTENT) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1714", color: "#EDE9E2", fontFamily: SS3 }}>
        Loading Tvindefossen…
      </div>
    );
  }

  return (
    <div ref={node => { containerRef.current = node; observedRef.current = node; }} data-scroll style={{ width: "100%", background: tk.bg, minHeight: "100vh", overflowY: "auto", overflowX: "hidden", fontFamily: SS3, transition: "background 0.35s ease" , ...SS4_SMOOTHING }}>
      <video ref={videoRef} muted autoPlay loop playsInline style={{ position: "fixed", top: 0, left: 0, width: 2, height: 2, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
        <source src="/__mockup/audio/tvinde-ambient.webm" type="video/webm" />
        <source src="/__mockup/audio/tvinde-ambient.mp4" type="video/mp4" />
      </video>


      {/* B1 HERO */}
      <div style={{ position: "relative", width: "100%", minHeight: isMobile ? "80vh" : isTablet ? "88vh" : "100dvh", overflow: "hidden" }}>
        <img data-bb-field="heroImage" data-bb-meta="heroImagePosition" src={CONTENT.heroImage} alt="" style={{ position: "absolute", top:0, right:0, bottom:0, left:0, width: "100%", height: "100%", objectFit: "cover", objectPosition: CONTENT.heroImagePosition }} />
        <div style={{ position: "absolute", top:0, right:0, bottom:0, left:0, background: "linear-gradient(to top,rgba(26,23,20,1) 0%,rgba(26,23,20,0.88) 10%,rgba(0,0,0,.5) 24%,rgba(0,0,0,.1) 40%,transparent 52%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top:0, right:0, bottom:0, left:0,   backgroundColor: cleared ? "rgba(14,12,10,0)" : "rgba(14,12,10,0.42)", opacity: cleared ? 0 : 1, transition: "background-color 2.6s cubic-bezier(.18,0,.38,1), opacity 2.6s cubic-bezier(.18,0,.38,1)", pointerEvents: "none", zIndex: 2 }} />

        <div style={{ position: "absolute", bottom: isMobile ? "2.4rem" : isTablet ? "3rem" : "3.8rem", left: isDesktop ? "50%" : 0, transform: isDesktop ? "translateX(-50%)" : "none", width: "100%", maxWidth: isDesktop ? COL : "none", zIndex: 3, padding: PAD, boxSizing: "border-box", opacity: textVisible ? 1 : 0, transition: "opacity 1.3s ease-in-out" }}>
          <h1 data-bb-field="name" style={{ margin: 0, ...T_PAGE_TITLE, fontSize: h1Size, color: "#EDE9E2" }}>{CONTENT.name}</h1>
          <p data-bb-field="tagline" style={{ margin: "0.8rem 0 0", ...T_TAGLINE, color: "#EDE9E2", opacity: 0.78 }}>{CONTENT.tagline}</p>
        </div>
      </div>

      {/* B2 ORIENT */}
      <div style={{ padding: isDesktop ? "4rem 1rem 0" : isTablet ? "3.5rem 1.4rem 0" : "2.8rem 1.25rem 0", maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
        <Fade>
          {isDesktop ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", paddingTop: "0.8rem", alignItems: "start" }}>
              <div>
                <p data-bb-field="lede" style={{ margin: "0 0 2.4rem", ...T_PULL_QUOTE, color: tk.body }}>{CONTENT.lede}</p>
                <div style={{ height: "1px", background: tk.rule }} />
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1.1rem" }}>
                  {[{ label: "About Tvindefossen", ref: storyRef }, { label: "Plan a visit", ref: planRef }].map(({ label, ref: r }) => (
                    <span key={label} onClick={() => scrollTo(r)} style={{ ...T_CARD_LABEL, color: tk.body, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px", textDecorationColor: isDark ? "#4D4A47" : "#B2AEA8", transition: "text-decoration-color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.textDecorationColor = "transparent")} onMouseLeave={e => (e.currentTarget.style.textDecorationColor = isDark ? "#4D4A47" : "#B2AEA8")}>{label}</span>
                  ))}
                </div>
              </div>
              <img data-bb-field="closeupPhoto" data-bb-meta="closeupPhoto.position" src={CONTENT.closeupPhoto.src} alt="" style={{ width: "100%", display: "block", aspectRatio: "3/4", objectFit: "cover", objectPosition: CONTENT.closeupPhoto.position }} />
            </div>
          ) : (
            <div>
              <p data-bb-field="lede" style={{ margin: `0 0 ${SEC}`, ...T_PULL_QUOTE, fontSize: isTablet ? T_SCALE_TEXT.pullQuote.tablet : T_SCALE_TEXT.pullQuote.mobile, color: tk.body }}>{CONTENT.lede}</p>
              <img data-bb-field="closeupPhoto" data-bb-meta="closeupPhoto.position" src={CONTENT.closeupPhoto.src} alt="" style={{ width: "100%", display: "block", aspectRatio: isTablet ? "16/9" : "4/3", objectFit: "cover", objectPosition: CONTENT.closeupPhoto.position }} />
            </div>
          )}
        </Fade>
      </div>

      {/* B3 SEE */}
      <div ref={storyRef} style={{ marginTop: SEC }}>
        <Fade duration={1.6}>
          <div style={{ padding: PAD, maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
            <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
              <img data-bb-field="widePhoto" src={CONTENT.widePhoto.src} alt="" style={{ width: "100%", display: "block", aspectRatio: isMobile ? "4/3" : "16/7", objectFit: "cover", objectPosition: "center 35%" }} />
              <div style={{ position: "absolute", top:0, right:0, bottom:0, left:0, background: `linear-gradient(to top,${tk.bg} 0%,rgba(26,23,20,.52) 14%,transparent 38%)`, pointerEvents: "none" }} />
            </div>
            <p data-bb-field="widePhoto.caption" style={{ margin: isMobile ? "0.75rem 0 0" : isTablet ? "0.8rem 0 0" : "0.9rem 0 0", ...T_MONO_CAPTION, color: tk.muted }}>{CONTENT.widePhoto.caption}</p>
          </div>
        </Fade>
      </div>

      {/* B4 VIDEO */}
      <div style={{ width: "100%", marginTop: SEC, aspectRatio: isMobile ? "16/9" : "16/6", background: tk.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...T_MONO_CAPTION, color: tk.muted }}>aerial video unavailable</span>
      </div>

      {/* B5 SPICE */}
      <div data-bb-field="spiceActive" style={{ padding: `${SEC} ${isMobile ? "1.25rem" : isTablet ? "1.4rem" : "1rem"} 0`, maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
        <Fade>
          <div>
            <div data-bb-field="spiceActive.label"><SectionLabel color={tk.body}>{CONTENT.spiceActive.label}</SectionLabel></div>
            {isDesktop ? (
              <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "3.6rem", borderLeft: `2px solid ${tk.bq}`, paddingLeft: "1.8rem" }}>
                <p data-bb-field="spiceActive.pullQuote" style={{ margin: 0, ...T_PULL_QUOTE, color: tk.head }}>{CONTENT.spiceActive.pullQuote}</p>
                <p data-bb-field="spiceActive.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, color: tk.body }}>{CONTENT.spiceActive.body}</p>
              </div>
            ) : (
              <div>
                <div style={{ borderLeft: `2px solid ${tk.bq}`, paddingLeft: "1.4rem", marginBottom: "1.4rem" }}>
                  <p data-bb-field="spiceActive.pullQuote" style={{ margin: 0, ...T_PULL_QUOTE, fontSize: isTablet ? T_SCALE_TEXT.pullQuote.tablet : T_SCALE_TEXT.pullQuote.mobile, color: tk.head }}>{CONTENT.spiceActive.pullQuote}</p>
                </div>
                <p data-bb-field="spiceActive.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: isMobile ? T_SCALE_BODY.mobile : T_SCALE_BODY.desktop, color: tk.body }}>{CONTENT.spiceActive.body}</p>
              </div>
            )}
          </div>
        </Fade>
      </div>

      {/* B6 EXPERIENTIAL */}
      <div style={{ padding: `${SEC} ${isMobile ? "1.25rem" : isTablet ? "1.4rem" : "1rem"} 0`, maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
        <Fade>
          <div data-bb-field="experiential" style={{ borderTop: `1px solid ${tk.rule}`, paddingTop: SEC }}>
            {isDesktop ? (
              <div style={{ display: "grid", gridTemplateColumns: "57% 43%", gap: "4rem", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {CONTENT.experiential.slice(0, 3).map((p, i) => <p data-bb-field="experiential.body" key={i} style={{ margin: 0, ...T_BODY_FUNCTIONAL, color: tk.body }}>{p}</p>)}
                </div>
                <div style={{ paddingLeft: "2rem" }}>
                  <p data-bb-field="experiential.body" style={{ margin: 0, ...T_SUB_QUOTE, color: tk.head }}>{CONTENT.experiential[3]}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1.2rem" : "1.4rem" }}>
                <p data-bb-field="experiential.body" style={{ margin: 0, ...T_SUB_QUOTE, fontSize: isMobile ? T_SCALE_TEXT.subQuote.mobile : T_SCALE_TEXT.subQuote.tablet, color: tk.head }}>{CONTENT.experiential[3]}</p>
                {CONTENT.experiential.slice(0, 3).map((p, i) => (
                  <p data-bb-field="experiential.body" key={i} style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: isMobile ? T_SCALE_BODY.mobile : T_SCALE_BODY.desktop, color: tk.body }}>{p}</p>
                ))}
              </div>
            )}
          </div>
        </Fade>
      </div>

      {/* B7 PLAN */}
      <div ref={planRef} style={{ padding: `${SEC} ${isMobile ? "1.25rem" : isTablet ? "1.4rem" : "1rem"} 0`, maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
        <Fade>
          <div style={{ borderTop: `1px solid ${tk.rule}`, paddingTop: SEC }}>
            <SectionLabel color={tk.body}>Plan your visit</SectionLabel>
            <p data-bb-field="practicalBody" style={{ margin: `0 0 ${isMobile ? "1.6rem" : "2.2rem"}`, ...T_BODY_FUNCTIONAL, fontSize: isMobile ? T_SCALE_BODY.mobile : T_SCALE_BODY.desktop, color: tk.body, maxWidth: isDesktop ? "58ch" : "none" }}>
              {isMobile ? CONTENT.practicalBody : CONTENT.practicalBody}
            </p>

            <div data-bb-field="quickFacts" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr", marginBottom: SEC, border: `1px solid ${tk.rule}`, borderRadius: "0.4rem", overflow: "hidden", background: tk.surface }}>
              {CONTENT.quickFacts.map(({ label, sub }, i) => {
                const isRight = isDesktop ? i < 3 : i % 2 === 0;
                const isTop = !isDesktop && i >= 2;
                return (
                  <div key={label} style={{ padding: isMobile ? "1.2rem 1.1rem" : "1.4rem 1.3rem", borderRight: isRight ? `1px solid ${tk.rule}` : "none", borderTop: isTop ? `1px solid ${tk.rule}` : "none" }}>
                    <span data-bb-field="quickFacts.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                    <span data-bb-field="quickFacts.sub" style={{ ...T_BODY_SMALL, letterSpacing: "0.02em", color: tk.body }}>{sub}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ margin: `0 0 ${isMobile ? "2rem" : "2.8rem"}` }}>
              <SeasonalFlow maxBarH={isMobile ? 32 : isTablet ? 36 : 40} labelColor={tk.body} barColor={tk.body} labelSize={isMobile ? "0.66rem" : "0.72rem"} monthSize={isMobile ? "0.5rem" : "0.58rem"} />
            </div>

            {isMobile ? (
              <div data-bb-field="planDetails" style={{ display: "flex", flexDirection: "column", border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", overflow: "hidden", marginBottom: SEC }}>
                {CONTENT.planDetails.map(({ label, body }, i) => (
                  <div key={label} style={{ padding: "1.3rem 1.2rem", borderTop: i > 0 ? `1px solid ${tk.rule}` : "none", background: tk.surface }}>
                    <span data-bb-field="planDetails.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                    <p data-bb-field="planDetails.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: T_SCALE_BODY.mobile, color: tk.body }}>{body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div data-bb-field="planDetails" style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr", border: `1px solid ${tk.rule}`, borderRadius: "0.4rem", overflow: "hidden", marginBottom: SEC }}>
                {CONTENT.planDetails.map(({ label, body }, i) => {
                  const isRight = isTablet ? i % 2 === 0 : i < 3;
                  const isTop = isTablet && i >= 2;
                  return (
                    <div key={label} style={{ padding: isTablet ? "1.5rem 1.2rem" : "1.6rem 1.4rem", borderRight: isRight ? `1px solid ${tk.rule}` : "none", borderTop: isTop ? `1px solid ${tk.rule}` : "none", background: tk.surface }}>
                      <span data-bb-field="planDetails.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                      <p data-bb-field="planDetails.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: isTablet ? T_SCALE_BODY.mobile : T_SCALE_BODY.desktop, color: tk.body }}>{body}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <p style={{ margin: "0 0 0.8rem", ...T_SECTION_LABEL, color: tk.body }}>Location</p>
            <WaterfallMap
              lng={6.488368} lat={60.725762}
              label="Tvindefossen"
              bounds={[6.415, 60.627, 6.489, 60.726]}
              nearbyLng={6.415} nearbyLat={60.627} nearbyLabel="Voss"
              height={isMobile ? 160 : 200}
              markerColor={tk.head}
              mutedColor={tk.body}
            />
          </div>
        </Fade>
      </div>

      {/* B8 CONTINUE */}
      <div style={{ padding: `${SEC} ${isMobile ? "1.25rem" : isTablet ? "1.4rem" : "1rem"} 0`, maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
        <Fade>
          <div style={{ borderTop: `1px solid ${tk.rule}`, paddingTop: SEC }}>
            <SectionLabel color={tk.body}>Continue</SectionLabel>
            {isDesktop ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.4rem" }}>
                <div data-bb-field="nextFall" style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", overflow: "hidden" }}>
                  <img data-bb-field="nextFall.hero" data-bb-meta="nextFall.hero.position" src={CONTENT.nextFall.hero.src} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: CONTENT.nextFall.hero.position, display: "block", opacity: 0.72 }} />
                  <div style={{ padding: "1.2rem 1.3rem 1.5rem", background: tk.surface }}>
                    <CardLabel muted={tk.head}>Next fall</CardLabel>
                    <p data-bb-field="nextFall.name" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontWeight: 400, color: tk.head, lineHeight: 1.4 }}>{CONTENT.nextFall.name}</p>
                    <p data-bb-field="nextFall.descriptor" style={{ margin: "0.45rem 0 0", ...T_BODY_SMALL, color: tk.body }}>{CONTENT.nextFall.descriptor}</p>
                  </div>
                </div>
                <div data-bb-field="continueCards" style={{ display: "contents" }}>
                  {CONTENT.continueCards.desktop.map(({ label, body }) => (
                    <div key={label} style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", padding: "1.6rem", display: "flex", flexDirection: "column", background: tk.surface }}>
                      <span data-bb-field="continueCards.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                      <p data-bb-field="continueCards.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, color: tk.body }}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : isTablet ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
                <div data-bb-field="nextFall" style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", overflow: "hidden" }}>
                  <img data-bb-field="nextFall.hero" data-bb-meta="nextFall.hero.position" src={CONTENT.nextFall.hero.src} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: CONTENT.nextFall.hero.position, display: "block", opacity: 0.72 }} />
                  <div style={{ padding: "1rem 1.2rem 1.3rem", background: tk.surface }}>
                    <CardLabel muted={tk.head}>Next fall</CardLabel>
                    <p data-bb-field="nextFall.name" style={{ margin: 0, ...T_BODY_FUNCTIONAL, color: tk.head }}>{CONTENT.nextFall.name}</p>
                    <p data-bb-field="nextFall.descriptor" style={{ margin: "0.4rem 0 0", ...T_BODY_SMALL, color: tk.body }}>{CONTENT.nextFall.descriptor}</p>
                  </div>
                </div>
                <div data-bb-field="continueCards" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {CONTENT.continueCards.tablet.map(({ label, body }) => (
                    <div key={label} style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", padding: "1.3rem", background: tk.surface, flex: 1 }}>
                      <span data-bb-field="continueCards.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                      <p data-bb-field="continueCards.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: T_SCALE_BODY.mobile, color: tk.body }}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <div data-bb-field="nextFall" style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", overflow: "hidden" }}>
                  <img data-bb-field="nextFall.hero" data-bb-meta="nextFall.hero.position" src={CONTENT.nextFall.hero.src} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", objectPosition: CONTENT.nextFall.hero.position, display: "block", opacity: 0.72 }} />
                  <div style={{ padding: "1rem 1.2rem 1.4rem", background: tk.surface }}>
                    <CardLabel muted={tk.head}>Next fall</CardLabel>
                    <p data-bb-field="nextFall.name" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: T_SCALE_BODY.mobile, fontWeight: 400, color: tk.head }}>{CONTENT.nextFall.name}</p>
                    <p data-bb-field="nextFall.descriptor" style={{ margin: "0.4rem 0 0", ...T_BODY_SMALL, color: tk.body }}>{CONTENT.nextFall.descriptor}</p>
                  </div>
                </div>
                <div data-bb-field="continueCards" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {CONTENT.continueCards.mobile.map(({ label, body }) => (
                    <div key={label} style={{ border: `1px solid ${tk.rule}`, borderRadius: "0.35rem", padding: "1.3rem", background: tk.surface }}>
                      <span data-bb-field="continueCards.label" style={{ ...T_SECTION_LABEL, color: tk.head, display: "block", marginBottom: "0.7rem" }}>{label}</span>
                      <p data-bb-field="continueCards.body" style={{ margin: 0, ...T_BODY_FUNCTIONAL, fontSize: T_SCALE_BODY.mobile, color: tk.body }}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Fade>
      </div>

      {/* GLOBAL FOOTER PLACEHOLDER */}
      <div style={{ marginTop: isMobile ? "3.5rem" : isTablet ? "4.5rem" : "5.5rem", borderTop: `1px solid ${tk.rule}`, padding: isMobile ? "2rem 1.25rem" : isTablet ? "2.4rem 1.4rem" : "2.8rem 1rem", background: tk.surface }}>
        <div style={{ maxWidth: isDesktop ? COL : "none", margin: isDesktop ? "0 auto" : 0 }}>
          <span style={{ ...T_MONO_CAPTION, color: tk.muted }}>Global footer unavailable in review</span>
        </div>
      </div>
    </div>
  );
}

export default TvindefossenFinal;
