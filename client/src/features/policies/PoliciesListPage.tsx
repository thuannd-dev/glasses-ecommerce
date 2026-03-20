import { Box, CircularProgress, Typography } from "@mui/material";
import { useMemo } from "react";

import { usePolicy } from "../../lib/hooks/usePolicy";
import { getPolicyTypeLabel } from "../../lib/types";

function formatIsoDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
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
  const effectiveText = effectiveTo
    ? `Effective ${effectiveFrom} through ${effectiveTo}.`
    : `Effective ${effectiveFrom}.`;

  const evidenceText = p.evidenceRequired
    ? "Supporting evidence (such as photos or videos) is required."
    : null;

  const customLensText = !p.customizedLensRefundable
    ? "Customized prescriptions/customized lenses are non-refundable."
    : null;

  const minOrderText =
    p.minOrderAmount != null && p.minOrderAmount > 0
      ? "Applies to orders above the minimum amount."
      : null;

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
      details: [returnWindow ? `Return window: ${returnWindow}` : null, refundText, evidenceText, customLensText, effectiveText, minOrderText].filter(
        Boolean,
      ) as string[],
    };
  }

  if (typeLabel === "Warranty") {
    const warrantyDuration =
      p.warrantyMonths != null
        ? `${p.warrantyMonths} month${p.warrantyMonths === 1 ? "" : "s"}`
        : null;
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
    details: [refundText, evidenceText, customLensText, effectiveText, minOrderText].filter(Boolean) as string[],
  };
}

function PoliciesListBase({ eyebrow, heading }: { eyebrow: string; heading: string }) {
  const { policies, isPoliciesLoading } = usePolicy();

  const ordered = useMemo(
    () =>
      [...policies].sort((a, b) => {
        const la = getPolicyTypeLabel(a.policyType);
        const lb = getPolicyTypeLabel(b.policyType);
        const order = ["Return", "Warranty", "Refund"];
        return order.indexOf(la) - order.indexOf(lb);
      }),
    [policies],
  );

  const friendlyPolicies = useMemo(() => ordered.map((p) => toFriendlyPolicy(p)), [ordered]);

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        width: "100vw",
        background:
          "radial-gradient(ellipse 90% 65% at 16% 22%, rgba(182,140,90,0.16) 0%, transparent 52%), radial-gradient(ellipse 70% 55% at 78% 55%, rgba(182,140,90,0.09) 0%, transparent 48%), linear-gradient(180deg,#0C0C0E 0%,#101012 42%,#0B0B0D 100%)",
        overflow: "hidden",
        mt: 1,
        px: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          // NavBar fixed (56px) nên cần offset để không bị che phần tiêu đề.
          pt: { xs: 7, md: 8 },
          pb: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 3.5 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(255,255,255,0.72)",
              mb: 1.2,
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display","Times New Roman",Times,serif',
              fontSize: { xs: 34, md: 56 },
              lineHeight: 1.03,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.94)",
            }}
          >
            {heading}
          </Typography>
        </Box>

        {isPoliciesLoading && friendlyPolicies.length === 0 ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
            {friendlyPolicies.map((p) => (
              <Box
                key={p.typeLabel + p.title}
                sx={{
                  borderRadius: 2.5,
                  border: "1px solid rgba(179,138,90,0.26)",
                  bgcolor: "rgba(255,255,255,0.03)",
                  px: 2.6,
                  py: 2.3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.62)",
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {p.typeLabel}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.92)", fontWeight: 650, fontSize: 24, mb: 1.2 }}>
                  {p.title}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.64)", lineHeight: 1.7, fontSize: 16.5, mb: 1.6 }}>
                  {p.summary}
                </Typography>

                <Box
                  sx={{
                    "& ul": {
                      m: 0,
                      p: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.6,
                    },
                    "& li": {
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 0.8,
                      color: "rgba(255,255,255,0.72)",
                      fontSize: 16,
                      lineHeight: 1.45,
                    },
                  }}
                >
                  <ul>
                    {p.details.map((d) => (
                      <li key={d}>
                        <Box
                          sx={{
                            mt: "0.55em",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "rgba(179,138,90,0.95)",
                            flexShrink: 0,
                          }}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function PoliciesGuaranteePage() {
  return <PoliciesListBase eyebrow="Customer guarantees" heading="Clear terms for eyewear support." />;
}

export function PoliciesLensReplacementPage() {
  return <PoliciesListBase eyebrow="Lens replacement" heading="Transparent lens replacement terms." />;
}

