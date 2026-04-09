import { TableCell, TableRow, Box, Stack, Typography, Chip } from "@mui/material";
import type { PolicyConfigurationDto } from "../../../lib/types";

interface PolicyDetailsExpandedRowProps {
  policy: PolicyConfigurationDto;
}

export function PolicyDetailsExpandedRow({ policy }: PolicyDetailsExpandedRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={5} sx={{ p: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Box sx={{ px: 2.25, py: 1.5, bgcolor: "#FFFFFF" }}>
          <Box
            sx={{
              bgcolor: "#FAFAF8",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "14px",
              p: { xs: 2, md: 2.25 },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              {/* Type-specific Fields */}
              {policy.policyType === "Return" && (
                <Stack spacing={0.8}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#8A8A8A",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Return Window Days
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                    {policy.returnWindowDays ?? "—"}
                  </Typography>
                </Stack>
              )}

              {policy.policyType === "Warranty" && (
                <Stack spacing={0.8}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#8A8A8A",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Warranty Months
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                    {policy.warrantyMonths ?? "—"}
                  </Typography>
                </Stack>
              )}

              {policy.policyType === "Refund" && (
                <>
                  <Stack spacing={0.8}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#8A8A8A",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Refund Window Days
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                      {policy.refundWindowDays ?? "—"}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.8}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#8A8A8A",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Refund Only Max Amount
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                      {policy.refundOnlyMaxAmount ? `$${policy.refundOnlyMaxAmount}` : "—"}
                    </Typography>
                  </Stack>
                </>
              )}

              {/* Common Fields */}
              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#8A8A8A",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Min Order Amount
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                  {policy.minOrderAmount ? `$${policy.minOrderAmount}` : "—"}
                </Typography>
              </Stack>
              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#8A8A8A",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Refund Allowed
                </Typography>
                <Chip
                  label={policy.refundAllowed ? "Yes" : "No"}
                  size="small"
                  color={policy.refundAllowed ? "success" : "default"}
                  variant={policy.refundAllowed ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                />
              </Stack>
              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#8A8A8A",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Evidence Required
                </Typography>
                <Chip
                  label={policy.evidenceRequired ? "Yes" : "No"}
                  size="small"
                  color={policy.evidenceRequired ? "success" : "default"}
                  variant={policy.evidenceRequired ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                />
              </Stack>
              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#8A8A8A",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Customized Lens Refundable
                </Typography>
                <Chip
                  label={policy.customizedLensRefundable ? "Yes" : "No"}
                  size="small"
                  color={policy.customizedLensRefundable ? "success" : "default"}
                  variant={policy.customizedLensRefundable ? "filled" : "outlined"}
                  sx={{ fontWeight: 700, fontSize: 12, width: "fit-content" }}
                />
              </Stack>
              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#8A8A8A",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Effective Period
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>
                  {new Date(policy.effectiveFrom).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {policy.effectiveTo &&
                    ` → ${new Date(policy.effectiveTo).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}`}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
}
