import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
  CircularProgress,
  FormHelperText,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import type { MeOrderDto, MeOrderItemDto } from "../../lib/types/order";
import type { AfterSalesTicketType } from "../../lib/types/afterSales";
import {
  AfterSalesTicketTypeValues,
} from "../../lib/types/afterSales";
import { useSubmitTicket } from "../../lib/hooks/useAfterSalesTickets";
import agent from "../../lib/api/agent";

interface SubmitTicketDialogProps {
  open: boolean;
  onClose: () => void;
  order: MeOrderDto;
}

const TICKET_TYPE_LABELS: Record<number, string> = {
  [AfterSalesTicketTypeValues.Return]: "Return",
  [AfterSalesTicketTypeValues.Warranty]: "Warranty",
  [AfterSalesTicketTypeValues.Refund]: "Refund",
};

const TICKET_TYPE_DESCRIPTIONS: Record<number, string> = {
  [AfterSalesTicketTypeValues.Return]:
    "Request to return the product and receive a refund",
  [AfterSalesTicketTypeValues.Warranty]:
    "Request warranty service for product defects or issues",
  [AfterSalesTicketTypeValues.Refund]: "Request a refund without returning the product",
};

export function SubmitTicketDialog({
  open,
  onClose,
  order,
}: Readonly<SubmitTicketDialogProps>) {
  const submitTicket = useSubmitTicket();

  // Form state
  const [ticketType, setTicketType] = useState<AfterSalesTicketType | "">(
    AfterSalesTicketTypeValues.Warranty
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [requestedAction, setRequestedAction] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | string>("");
  const [attachments, setAttachments] = useState<
    Array<{
      file: File;
      fileName: string;
      fileUrl: string;
      fileExtension?: string;
    }>
  >([]);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    if (attachments.length + files.length > 5) {
      setFormError("Maximum 5 files allowed");
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Upload file to server
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await agent.post<{ url: string; publicId: string }>(
          "/uploads/image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const fileUrl = uploadResponse.data.url;
        const fileExtension = file.name.split(".").pop() || "";

        setAttachments((prev) => [
          ...prev,
          {
            file,
            fileName: file.name,
            fileUrl,
            fileExtension,
          },
        ]);
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? `File upload failed: ${err.message}`
          : "Failed to upload files. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!ticketType) {
      setFormError("Please select a ticket type");
      return;
    }
    if (!reason.trim()) {
      setFormError("Please enter a reason");
      return;
    }

    setFormError("");

    try {
      await submitTicket.mutateAsync({
        orderId: order.id,
        orderItemId: selectedItemId,
        ticketType: ticketType as AfterSalesTicketType,
        reason: reason.trim(),
        requestedAction: requestedAction.trim() || null,
        refundAmount: refundAmount ? Number.parseFloat(String(refundAmount)) : null,
        attachments: attachments.map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileExtension: att.fileExtension,
        })),
      });

      // Success — close dialog
      handleClose();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to submit ticket. Please try again."
      );
    }
  };

  const handleClose = () => {
    // Reset form
    setTicketType(AfterSalesTicketTypeValues.Warranty);
    setSelectedItemId(null);
    setReason("");
    setRequestedAction("");
    setRefundAmount("");
    setAttachments([]);
    setFormError("");

    onClose();
  };

  const itemOptions = order.items || [];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { maxHeight: "90vh" },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Submit After-Sales Request</DialogTitle>

      <DialogContent sx={{ overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
          {/* Ticket Type Selection */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
              Request Type *
            </FormLabel>
            <RadioGroup
              value={ticketType}
              onChange={(e) => {
                setTicketType(Number.parseInt(e.target.value) as AfterSalesTicketType);
                setFormError("");
              }}
            >
              {[
                AfterSalesTicketTypeValues.Warranty,
                AfterSalesTicketTypeValues.Return,
                AfterSalesTicketTypeValues.Refund,
              ].map((typeId) => (
                <Paper
                  key={typeId}
                  elevation={0}
                  sx={{
                    border: `2px solid ${
                      ticketType === typeId ? "#2563eb" : "#e5e7eb"
                    }`,
                    borderRadius: 2,
                    p: 2,
                    mb: 1,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#2563eb",
                      bgcolor: "rgba(37, 99, 235, 0.04)",
                    },
                  }}
                >
                  <FormControlLabel
                    value={typeId}
                    control={<Radio />}
                    label={
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>
                          {TICKET_TYPE_LABELS[typeId]}
                        </Typography>
                        <Typography fontSize={13} color="text.secondary">
                          {TICKET_TYPE_DESCRIPTIONS[typeId]}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: "100%", m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>

          {/* Item Selection (Optional) */}
          {itemOptions.length > 1 && (
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
                Item (optional — leave blank for entire order)
              </FormLabel>
              <RadioGroup
                value={selectedItemId || ""}
                onChange={(e) => {
                  setSelectedItemId(e.target.value || null);
                }}
              >
                <FormControlLabel
                  value=""
                  control={<Radio />}
                  label="Entire order"
                />
                {itemOptions.map((item: MeOrderItemDto) => (
                  <FormControlLabel
                    key={item.id}
                    value={item.id}
                    control={<Radio />}
                    label={
                      <Typography fontSize={14}>
                        {item.productName}
                        <Chip
                          label={`Qty: ${item.quantity}`}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* Reason (Required) */}
          <TextField
            label="Reason *"
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setFormError("");
            }}
            placeholder="Please describe the issue or reason for your request..."
            helperText="Provide details about why you're submitting this request"
          />

          {/* Requested Action (Optional) */}
          <TextField
            label="Requested Action (optional)"
            multiline
            rows={2}
            fullWidth
            value={requestedAction}
            onChange={(e) => setRequestedAction(e.target.value)}
            placeholder="E.g., 'Please replace with a new frame' or 'Repair the left lens'"
            helperText="Let us know your preferred resolution"
          />

          {/* Refund Amount (Optional, only for Refund type) */}
          {ticketType === AfterSalesTicketTypeValues.Refund && (
            <TextField
              label="Refund Amount (optional)"
              type="number"
              fullWidth
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0"
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: order.totalAmount,
                  step: 0.01,
                },
              }}
              helperText={`Maximum: ${order.totalAmount.toFixed(2)}`}
            />
          )}

          {/* File Attachments */}
          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
              Attachments (optional)
            </FormLabel>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={uploading || submitTicket.isPending}
              sx={{ textTransform: "none", mb: 1 }}
            >
              {uploading ? "Uploading..." : "Choose Files"}
              <input
                hidden
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </Button>
            <FormHelperText>
              Upload photos or documents (images, PDF). Max 5 files.
            </FormHelperText>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {attachments.map((att, idx) => (
                  <Paper
                    key={att.fileName + att.fileUrl}
                    elevation={0}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      border: "1px solid #e5e7eb",
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize={14} sx={{ wordBreak: "break-all" }}>
                        {att.fileName}
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {(att.file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveAttachment(idx)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Paper>
                ))}
              </Box>
            )}
          </FormControl>

          {/* Error Message */}
          {formError && (
            <Typography
              color="error"
              fontSize={14}
              sx={{
                p: 1.5,
                bgcolor: "rgba(220, 38, 38, 0.1)",
                borderRadius: 1,
              }}
            >
              {formError}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={submitTicket.isPending || uploading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitTicket.isPending || uploading || !ticketType || !reason.trim()}
          sx={{ textTransform: "none" }}
        >
          {submitTicket.isPending ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
