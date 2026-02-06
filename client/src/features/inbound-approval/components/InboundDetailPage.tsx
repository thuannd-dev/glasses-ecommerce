import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack, Check, Close, Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "../../manager copy/layout/Sidebar";
import { toast } from "react-toastify";
import { inboundApprovalService } from "../../../services/inboundApproval.mock";
import type { InboundRecord } from "../../../services/inbound.types";
import { InboundRecordStatus } from "../../../services/inbound.types";
import ApproveDialog from "./ApproveDialog";
import RejectDialog from "./RejectDialog";

interface InboundDetailPageProps {
  recordId: string;
  onBack: () => void;
}

export default function InboundDetailPage({ recordId, onBack }: InboundDetailPageProps) {
  const [record, setRecord] = useState<InboundRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const data = await inboundApprovalService.getInboundRecordById(recordId);
        if (!data) {
          setError("Record not found");
          return;
        }
        setRecord(data);
      } catch (err) {
        setError("Failed to load record");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const currentUser = inboundApprovalService.getCurrentUser();
  const canApproveOrReject =
    record && record.createdBy !== currentUser.id && record.status === InboundRecordStatus.PendingApproval;
  const cannotApproveReason = record && record.createdBy === currentUser.id ? "You cannot approve your own inbound record" : "";

  const handleApprove = async () => {
    if (!record) return;

    try {
      setSubmitting(true);
      const result = await inboundApprovalService.approveInboundRecord(
        record.id,
        {
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser.id,
        },
        currentUser,
      );

      if (result.success && result.record) {
        setRecord(result.record);
        toast.success("Inbound record approved successfully");
        setApproveDialogOpen(false);
        setTimeout(() => onBack(), 1500);
      } else {
        toast.error(result.error || "Failed to approve record");
      }
    } catch (err) {
      toast.error("Error approving record");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!record) return;

    try {
      setSubmitting(true);
      const result = await inboundApprovalService.rejectInboundRecord(
        record.id,
        {
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason,
        },
        currentUser,
      );

      if (result.success && result.record) {
        setRecord(result.record);
        toast.success("Inbound record rejected");
        setRejectDialogOpen(false);
        setTimeout(() => onBack(), 1500);
      } else {
        toast.error(result.error || "Failed to reject record");
      }
    } catch (err) {
      toast.error("Error rejecting record");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flex: 1, pt: 4, px: 3 }}>
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => setSidebarOpen(true)}
                startIcon={<MenuIcon />}
                sx={{ color: "#3498db" }}
              >
                Menu
              </Button>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !record) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box sx={{ flex: 1, pt: 4, px: 3 }}>
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <Button
                onClick={() => setSidebarOpen(true)}
                startIcon={<MenuIcon />}
                sx={{ color: "#3498db" }}
              >
                Menu
              </Button>
            </Box>
          )}
          <Container maxWidth="lg" sx={{ p: 0 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ mb: 2, textTransform: "none" }}
            >
              Back
            </Button>
            <Alert severity="error">{error || "Record not found"}</Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  const sourceTypeLabels: Record<number, string> = {
    0: "Unknown",
    1: "Supplier",
    2: "Return",
    3: "Adjustment",
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, pt: 4, px: 3 }}>
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => setSidebarOpen(true)}
              startIcon={<MenuIcon />}
              sx={{ color: "#3498db" }}
            >
              Menu
            </Button>
          </Box>
        )}
        <Container maxWidth="lg" sx={{ p: 0 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Back to List
      </Button>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 900,
              color: "rgba(15,23,42,0.92)",
              mb: 0.5,
            }}
          >
            Inbound Record Details
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.60)" }}>
            Reference: {record.sourceReference || record.id}
          </Typography>
        </Box>

        {record.status === InboundRecordStatus.PendingApproval && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip
              title={
                !canApproveOrReject && record.createdBy === currentUser.id
                  ? cannotApproveReason
                  : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={!canApproveOrReject || submitting}
                  sx={{ textTransform: "none" }}
                >
                  Approve
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                !canApproveOrReject && record.createdBy === currentUser.id
                  ? cannotApproveReason
                  : ""
              }
            >
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Close />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={!canApproveOrReject || submitting}
                  sx={{ textTransform: "none" }}
                >
                  Reject
                </Button>
              </span>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Record Info */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          mb: 3,
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
              Source
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 0.5 }}>
              {sourceTypeLabels[record.sourceType]}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
              Created By
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 0.5 }}>
              {record.creator?.displayName || "Unknown"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
              {record.creator?.email}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
              Created At
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 0.5 }}>
              {new Date(record.createdAt).toLocaleDateString()}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.60)" }}>
              {new Date(record.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        {record.notes && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: "rgba(15,23,42,0.02)", borderRadius: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)", mb: 1 }}>
              Notes
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.75)" }}>
              {record.notes}
            </Typography>
          </Box>
        )}

        {record.status !== InboundRecordStatus.PendingApproval && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: "rgba(15,23,42,0.02)", borderRadius: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
                  Status
                </Typography>
                <Chip
                  label={
                    record.status === InboundRecordStatus.Approved ? "Approved" : "Rejected"
                  }
                  color={record.status === InboundRecordStatus.Approved ? "success" : "error"}
                  variant="outlined"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>
              {record.approvedBy && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
                    Approved At
                  </Typography>
                  <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                    {new Date(record.approvedAt!).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              {record.rejectionReason && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(15,23,42,0.65)" }}>
                    Rejection Reason
                  </Typography>
                  <Typography sx={{ fontSize: 13, mt: 0.5 }}>
                    {record.rejectionReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Card>

      {/* Items Table */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15,23,42,0.1)" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            Items ({record.items.length})
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(15,23,42,0.05)" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Variant</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, textAlign: "right" }}>
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {record.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: 13 }}>
                  {item.product?.productName || "N/A"}
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontFamily: "monospace" }}>
                  {item.productVariant?.sku || "N/A"}
                </TableCell>
                <TableCell sx={{ fontSize: 13 }}>
                  {item.productVariant?.variantName || "N/A"}
                </TableCell>
                <TableCell sx={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>
                  {item.quantity}
                </TableCell>
                <TableCell sx={{ fontSize: 13, color: "rgba(15,23,42,0.60)" }}>
                  {item.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ApproveDialog
        open={approveDialogOpen}
        record={record}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={handleApprove}
        isLoading={submitting}
      />

      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
        isLoading={submitting}
      />
        </Container>
      </Box>
    </Box>
  );
}
