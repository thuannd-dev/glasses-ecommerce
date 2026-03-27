import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";

import { usePolicy } from "../../../../lib/hooks/usePolicy";
import { getPolicyTypeLabel } from "../../../../lib/types";

const SECTION_SX = {
  position: "relative",
  left: "50%",
  right: "50%",
  ml: "-50vw",
  mr: "-50vw",
  width: "100vw",
  mt: { xs: "-1px", md: "-2px" },
  // Single unified “stage” — intro + right column read as one surface (no tile seams).
  background:
    "radial-gradient(ellipse 90% 65% at 16% 22%, rgba(182,140,90,0.16) 0%, transparent 52%), radial-gradient(ellipse 70% 55% at 78% 55%, rgba(182,140,90,0.09) 0%, transparent 48%), linear-gradient(180deg,#0C0C0E 0%,#101012 42%,#0B0B0D 100%)",
  overflow: "hidden",
} as const;

const WRAP_SX = {
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  flex: "1 1 auto",
  py: 0,
} as const;

const WALL_SX = {
  display: "grid",
  gap: 0,
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(6, minmax(0, 1fr))",
  },
  gridAutoFlow: "row",
  alignItems: "stretch",
  width: "100%",
  minWidth: 0,
} as const;

const INTRO_SX = {
  gridColumn: { xs: "auto", md: "span 2" },
  gridRow: { xs: "auto", md: "span 3" },
  minHeight: { xs: 480, md: 540 },
  background: "transparent",
  color: "rgba(255,255,255,0.92)",
  borderRight: "none",
  borderBottom: "none",
  px: { xs: 2.5, md: 3.5 },
  py: { xs: 4.5, md: 4 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
} as const;

const POLICY_TILE_SX = {
  gridColumn: { xs: "auto", md: "span 4" },
  gridRow: { xs: "auto", md: "span 3" },
  minHeight: { xs: 390, md: 540 },
  borderRight: "none",
  borderBottom: "none",
  background: "transparent",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "stretch",
} as const;

const POLICY_STACK_SX = {
  ...POLICY_TILE_SX,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  width: "100%",
  position: "relative" as const,
  overflow: "hidden",
  // Create inner "frame" so stacked sheets are contained (matches sketch).
  // Since deck layers are absolutely positioned, padding alone won't inset them.
  "--deck-inset-x": "26px",
  // Slight left shift on desktop (small difference keeps it subtle).
  "--deck-inset-left-x": { xs: "26px", md: "24px" },
  "--deck-inset-right-x": { xs: "26px", md: "28px" },
  "--deck-inset-y": "22px",
};

const DECK_CARD_RADIUS = 20;
const DECK_CARD_SX = {
  height: "100%",
  width: "100%",
  borderRadius: DECK_CARD_RADIUS,
  clipPath: `inset(0 round ${DECK_CARD_RADIUS}px)`,
  overflow: "hidden",
  display: "flex",
  // Dark luxury panel (moody, integrated with the dark section).
  background: "linear-gradient(180deg,#1B1917 0%, #141312 70%, #0F0E0D 100%)",
  border: "1px solid rgba(179,138,90,0.38)",
} as const;

const DECK_UNDERLAY_SX = {
  position: "absolute" as const,
  top: "var(--deck-inset-y, 22px)",
  bottom: "var(--deck-inset-y, 22px)",
  left: "var(--deck-inset-left-x, var(--deck-inset-x, 26px))",
  right: "var(--deck-inset-right-x, var(--deck-inset-x, 26px))",
  borderRadius: DECK_CARD_RADIUS,
  clipPath: `inset(0 round ${DECK_CARD_RADIUS}px)`,
  overflow: "hidden",
  background: "linear-gradient(180deg,#1B1917 0%, #141312 70%, #0F0E0D 100%)",
  border: "1px solid rgba(179,138,90,0.22)",
  // Darker shadow so the stack feels embedded in the section.
  boxShadow: "0 28px 80px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(179,138,90,0.16)",
  zIndex: 0,
  pointerEvents: "none",
} as const;

const DECK_LAYER_TARGETS = [
  { x: 0, y: 0, opacity: 1, scale: 1, zIndex: 3 },
  // Older cards sit up-left behind the active card (as in your sketch)
  { x: 14, y: 10, opacity: 0.84, scale: 0.995, zIndex: 2 },
  // Oldest sheet
  // Keep within right inset so the 3rd card still peeks (avoid “only 2 corners”).
  // Move further up-left relative to the middle layer so the 3rd card peeks again.
  { x: 14, y: 9, opacity: 0.72, scale: 0.99, zIndex: 1 },
] as const;

const DECK_LAYER_SHADOWS = [
  "0 18px 50px rgba(0,0,0,0.10)",
  "0 12px 30px rgba(0,0,0,0.09)",
  "0 7px 18px rgba(0,0,0,0.06)",
] as const;

const DECK_LAYER_BORDERS = [
  "1px solid rgba(179,138,90,0.52)", // active
  "1px solid rgba(179,138,90,0.32)", // middle
  "1px solid rgba(179,138,90,0.22)", // bottom (3rd card)
] as const;

const DECK_NEW_ACTIVE_INITIAL = {
  x: 30,
  y: 20,
  opacity: 0.9,
  scale: 0.985,
} as const;

const POLICY_PICKER_SX = {
  display: "flex",
  gap: 1.5,
  mt: 1.9,
  alignItems: "center",
} as const;

const POLICY_PICKER_BTN_SX = (active: boolean) => ({
  px: 0,
  py: 0,
  minWidth: "auto",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.62)",
  borderRadius: 0,
  background: "transparent",
  border: 0,
  cursor: "pointer",
  padding: 0,
  "&:focus-visible": { outline: "2px solid rgba(182,140,90,0.65)", outlineOffset: 4 },
}) as const;

const PANEL_ANIM_EASE = [0.22, 1, 0.36, 1] as const;

const EYEBROW_SX = {
  fontSize: 11,
  letterSpacing: "0.34em",
  textTransform: "uppercase" as const,
  fontWeight: 700,
  color: "rgba(255,255,255,0.72)",
} as const;

const HEADING_SX = {
  // Editorial headline scale (match AboutStory emphasis).
  fontSize: { xs: 35, md: 50 },
  lineHeight: 1.03,
  fontWeight: 500,
  letterSpacing: "-0.02em",
  mb: 1.5,
  color: "rgba(255,255,255,0.94)",
  fontFamily: '"Playfair Display","Times New Roman",Times,serif',
} as const;

const BODY_SX = {
  fontSize: 14,
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.72)",
  maxWidth: 420,
} as const;

const CTA_SX = {
  mt: 2.5,
  bgcolor: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(182,140,90,0.55)",
  borderRadius: 999,
  px: 2.8,
  py: 1.2,
  fontWeight: 900,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(182,140,90,0.75)",
  },
  "&:focus-visible": {
    outline: "2px solid rgba(182,140,90,0.5)",
    outlineOffset: 3,
  },
} as const;

const VISUAL_SX = {
  flex: "0 0 44%",
  position: "relative",
  overflow: "hidden",
  // Left media half: darker, rich stone tone.
  bgcolor: "#121110",
  // Use inset shadow instead of border to reduce "double line" artifacts.
  boxShadow: "inset -1px 0 0 rgba(255,255,255,0.08)",
} as const;

const VISUAL_IMG_SX = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center 35%",
  transform: "scale(1.02)",
} as const;

const VISUAL_OVERLAY_SX = {
  pointerEvents: "none",
  position: "absolute" as const,
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0.28) 100%)",
  mixBlendMode: "multiply" as const,
  opacity: 0.48,
} as const;

const CONTENT_SX = {
  flex: 1,
  px: { xs: 2, md: 2.5 },
  py: { xs: 1.9, md: 2.4 },
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "flex-start",
  gap: 0.78,
  // Right content half: darker luxury panel.
  background: "linear-gradient(180deg, #1B1917 0%, #141312 100%)",
} as const;

const POLICY_LABEL_SX = {
  ...EYEBROW_SX,
  color: "rgba(255,255,255,0.62)",
  fontSize: 12.5,
} as const;

const POLICY_TITLE_SX = {
  fontWeight: 650,
  fontSize: { xs: 20.5, md: 22.5 },
  color: "rgba(255,255,255,0.92)",
  mb: 0.2,
} as const;

const POLICY_SUMMARY_SX = {
  fontSize: { xs: 16.8, md: 18 },
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.62)",
  maxWidth: 520,
} as const;

const DETAILS_SX = {
  mt: 0.6,
  "& ul": {
    m: 0,
    p: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 0.55,
  },
  "& li": {
    display: "flex",
    alignItems: "flex-start",
    gap: 0.8,
    color: "rgba(255,255,255,0.72)",
    fontSize: 16.2,
    lineHeight: 1.45,
  },
} as const;

const DETAIL_DOT_SX = {
  mt: "0.55em",
  width: 6,
  height: 6,
  borderRadius: "50%",
  bgcolor: "rgba(179,138,90,0.95)",
  flexShrink: 0,
} as const;

function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(d);
}

type FriendlyPolicy = {
  typeLabel: string;
  title: string;
  summary: string;
  details: string[];
};

function toFriendlyPolicy(p: {
  policyType: number | string;
  policyName: string;
  returnWindowDays: number | null;
  warrantyMonths: number | null;
  refundAllowed: boolean;
  customizedLensRefundable: boolean;
  evidenceRequired: boolean;
  minOrderAmount: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}): FriendlyPolicy {
  const typeLabel = getPolicyTypeLabel(p.policyType);
  const effectiveFrom = formatIsoDate(p.effectiveFrom);
  const effectiveTo = p.effectiveTo ? formatIsoDate(p.effectiveTo) : null;
  const effectiveText = effectiveTo ? `Effective ${effectiveFrom} through ${effectiveTo}.` : `Effective ${effectiveFrom}.`;

  const evidenceText = p.evidenceRequired
    ? "Supporting evidence (such as photos or videos) is required."
    : null;

  const customLensText = !p.customizedLensRefundable
    ? "Customized prescriptions/customized lenses are non-refundable."
    : null;

  const minOrderText =
    p.minOrderAmount != null && p.minOrderAmount > 0 ? `Applies to orders above the minimum amount.` : null;

  const refundText = p.refundAllowed
    ? "Refunds are available for eligible cases."
    : "Refunds are not available under this policy.";

  if (typeLabel === "Return") {
    const returnWindow = p.returnWindowDays != null ? `${p.returnWindowDays} days` : null;
    return {
      typeLabel,
      title: p.policyName || "Return Policy",
      summary:
        returnWindow != null
          ? `Return eligible items within ${returnWindow}.`
          : "Return eligible items according to the terms.",
      details: [
        returnWindow ? `Return window: ${returnWindow}` : null,
        refundText,
        evidenceText,
        customLensText,
        effectiveText,
        minOrderText,
      ].filter(Boolean) as string[],
    };
  }

  if (typeLabel === "Warranty") {
    const warrantyDuration =
      p.warrantyMonths != null ? `${p.warrantyMonths} month${p.warrantyMonths === 1 ? "" : "s"}` : null;
    return {
      typeLabel,
      title: p.policyName || "Warranty Policy",
      summary:
        warrantyDuration != null
          ? `Your frames are covered for ${warrantyDuration}.`
          : "Warranty coverage applies under the terms.",
      details: [
        warrantyDuration ? `Warranty duration: ${warrantyDuration}` : null,
        refundText,
        evidenceText,
        customLensText,
        effectiveText,
        minOrderText,
      ].filter(Boolean) as string[],
    };
  }

  // Refund
  return {
    typeLabel,
    title: p.policyName || "Refund Policy",
    summary: p.refundAllowed ? "Refunds may be available for eligible orders." : "Refunds are not available under this policy.",
    details: [
      refundText,
      evidenceText,
      customLensText,
      effectiveText,
      minOrderText,
    ].filter(Boolean) as string[],
  };
}

const POLICY_VISUALS: Record<string, { img: string }> = {
  Return: {
    img: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944646/daniel-monteiro-0PldvPd38AE-unsplash_rgwybx.jpg",
  },
  Warranty: {
    img: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944646/igor-rand-7Q7EECqkfLo-unsplash_tbybaj.jpg",
  },
  Refund: {
    img: "https://res.cloudinary.com/ds0b8jtbr/image/upload/v1773944646/isco-bM71A7Ip7fA-unsplash_muvt6y.jpg",
  },
};

export default function PolicySection() {
  const { policies, isPoliciesLoading } = usePolicy();
  const navigate = useNavigate();

  const ordered = useMemo(
    () =>
      [...policies].sort((a, b) => {
        const la = getPolicyTypeLabel(a.policyType);
        const lb = getPolicyTypeLabel(b.policyType);
        const order = ["Return", "Refund","Warranty"];
        return order.indexOf(la) - order.indexOf(lb);
      }),
    [policies],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [ordered.length]);

  // Auto-swap the policy deck (switches activeIndex, stacked cards follow).
  useEffect(() => {
    if (isPoliciesLoading) return;
    if (ordered.length <= 1) return;

    const AUTO_SWAP_MS = 4500;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ordered.length);
    }, AUTO_SWAP_MS);

    return () => window.clearInterval(id);
  }, [ordered.length, isPoliciesLoading]);

  const prevActiveIndexRef = useRef(activeIndex);
  useEffect(() => {
    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  const getDeckPolicies = (startIndex: number) => {
    const len = ordered.length;
    if (!len) return [];

    const stackIndices = [startIndex, startIndex + 1, startIndex + 2];
    const result: typeof ordered = [];
    const seen = new Set<string>();

    for (const rawIdx of stackIndices) {
      const idx = (rawIdx % len + len) % len;
      const p = ordered[idx];
      if (!p) continue;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      result.push(p);
    }

    return result;
  };

  const deckPolicies = getDeckPolicies(activeIndex);
  const prevDeckPolicies = getDeckPolicies(prevActiveIndexRef.current);
  const prevLayerById = useMemo(() => new Map(prevDeckPolicies.map((p, idx) => [p.id, idx])), [prevDeckPolicies]);

  return (
    <Box component="section" sx={SECTION_SX}>
      <Box sx={WRAP_SX}>
        <Box sx={WALL_SX}>
          {/* Intro tile */}
          <Box sx={INTRO_SX}>
            <Typography sx={{ ...EYEBROW_SX, mb: 1.2 }}>Service & Support Policy</Typography>
            <Typography component="h2" sx={HEADING_SX}>
              Reliable eyewear support
              <br />
              Guided by refined policies.
            </Typography>
            <Typography sx={BODY_SX}>
              Hassle-free return, refund, and warranty terms—so you can buy with confidence. Straightforward rules,
              no surprises—just clarity.
            </Typography>
            {ordered.length > 1 && (
              <Box sx={POLICY_PICKER_SX}>
                {ordered.map((p, idx) => {
                  const label = getPolicyTypeLabel(p.policyType);
                  const active = idx === activeIndex;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      style={{ all: "unset", cursor: "pointer" }}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Show ${label} policy`}
                    >
                      <Box component="span" sx={POLICY_PICKER_BTN_SX(active)}>
                        {label}
                      </Box>
                    </button>
                  );
                })}
              </Box>
            )}

            <Button onClick={() => navigate("/policies")} variant="outlined" sx={CTA_SX}>
              View more policy
            </Button>
          </Box>

          {/* Policy deck (stacked rounded cards) */}
          <Box sx={POLICY_STACK_SX}>
            <Box sx={DECK_UNDERLAY_SX} />
            <AnimatePresence mode="sync" initial={false}>
              {isPoliciesLoading && ordered.length === 0 ? (
                <motion.div
                  key="loading"
                  style={{
                    position: "absolute",
                    top: "var(--deck-inset-y, 22px)",
                    bottom: "var(--deck-inset-y, 22px)",
                    left: "var(--deck-inset-left-x, var(--deck-inset-x, 26px))",
                    right: "var(--deck-inset-right-x, var(--deck-inset-x, 26px))",
                    display: "flex",
                    borderRadius: DECK_CARD_RADIUS,
                    clipPath: `inset(0 round ${DECK_CARD_RADIUS}px)`,
                    overflow: "hidden",
                  }}
                  initial={{ x: 0, y: 12, opacity: 0, scale: 0.99 }}
                  animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: PANEL_ANIM_EASE }}
                >
                  <Box sx={VISUAL_SX} />
                  <Box sx={CONTENT_SX}>
                    <Typography sx={POLICY_LABEL_SX}>Loading</Typography>
                    <Typography sx={POLICY_TITLE_SX}>Policy details</Typography>
                    <Typography sx={POLICY_SUMMARY_SX}>Please wait a moment…</Typography>
                  </Box>
                </motion.div>
              ) : (
                deckPolicies.map((p, layer) => {
                  const friendly = toFriendlyPolicy(p);
                  const img = POLICY_VISUALS[friendly.typeLabel]?.img ?? POLICY_VISUALS.Return.img;

                  const target = DECK_LAYER_TARGETS[layer] ?? DECK_LAYER_TARGETS[2];
                  const prevLayer = prevLayerById.get(p.id);

                  // If the policy existed in the previous deck layer, animate from its old position.
                  // Otherwise treat it as the "new top sheet" entering from bottom-right.
                  const initial =
                    prevLayer == null
                      ? layer === 0
                        ? {
                            ...DECK_NEW_ACTIVE_INITIAL,
                            boxShadow: DECK_LAYER_SHADOWS[layer] ?? DECK_LAYER_SHADOWS[2],
                          }
                        : {
                            // Tail sheet just appears underneath; keep movement minimal.
                            x: target.x,
                            y: target.y,
                            // Show immediately to avoid the “only 2 cards” moment mid-transition.
                            opacity: target.opacity,
                            scale: target.scale,
                            boxShadow: DECK_LAYER_SHADOWS[layer] ?? DECK_LAYER_SHADOWS[2],
                          }
                      : {
                          x: DECK_LAYER_TARGETS[prevLayer]?.x ?? target.x,
                          y: DECK_LAYER_TARGETS[prevLayer]?.y ?? target.y,
                          opacity: DECK_LAYER_TARGETS[prevLayer]?.opacity ?? target.opacity,
                          scale: DECK_LAYER_TARGETS[prevLayer]?.scale ?? target.scale,
                          boxShadow: DECK_LAYER_SHADOWS[prevLayer] ?? DECK_LAYER_SHADOWS[2],
                        };

                  return (
                    <motion.div
                      key={p.id}
                      style={{
                        position: "absolute",
                        top: "var(--deck-inset-y, 22px)",
                        bottom: "var(--deck-inset-y, 22px)",
                        left: "var(--deck-inset-left-x, var(--deck-inset-x, 26px))",
                        right: "var(--deck-inset-right-x, var(--deck-inset-x, 26px))",
                        pointerEvents: "none",
                        zIndex: target.zIndex,
                        borderRadius: DECK_CARD_RADIUS,
                        clipPath: `inset(0 round ${DECK_CARD_RADIUS}px)`,
                        overflow: "hidden",
                      }}
                      initial={initial}
                      animate={{
                        x: target.x,
                        y: target.y,
                        opacity: target.opacity,
                        scale: target.scale,
                        boxShadow: DECK_LAYER_SHADOWS[layer] ?? DECK_LAYER_SHADOWS[2],
                      }}
                      // Exit theo hướng xuống-phải để không “kéo lộ” đuôi ở góc trên phải.
                      exit={{ opacity: 0, x: 36, y: 26, scale: 0.99, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                      transition={{ duration: 0.45, ease: PANEL_ANIM_EASE }}
                    >
                      <Box sx={{ ...DECK_CARD_SX, border: DECK_LAYER_BORDERS[layer] }}>
                        <Box sx={VISUAL_SX}>
                          <Box component="img" src={img} alt={friendly.typeLabel} sx={VISUAL_IMG_SX} />
                          <Box sx={VISUAL_OVERLAY_SX} />
                        </Box>

                        <Box sx={CONTENT_SX}>
                          <Typography sx={POLICY_LABEL_SX}>{friendly.typeLabel}</Typography>
                          <Typography sx={POLICY_TITLE_SX}>{friendly.title}</Typography>
                          <Typography sx={POLICY_SUMMARY_SX}>{friendly.summary}</Typography>

                          <Box sx={DETAILS_SX}>
                            <ul>
                              {friendly.details.map((d) => (
                                <li key={d}>
                                  <Box sx={DETAIL_DOT_SX} />
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

