import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  TextField,
  Chip,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CustomerOrderDetailDto } from "../../lib/types/order";
import agent from "../../lib/api/agent";

type SubmitAfterSalesTicketDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly order: CustomerOrderDetailDto | null;
  readonly onSuccess: () => void;
};

type UploadedFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileExtension?: string;
};

const PALETTE = {
  textMain: "#171717",
  textSecondary: "#6B6B6B",
  textMuted: "#8A8A8A",
  accent: "#B68C5A",
  accentHover: "#9E7748",
  cardBorder: "#ECECEC",
  divider: "#F1F1F1",
};

const STEPS = ["Ticket Type", "Select Items", "Reason", "Upload Evidence"];

export function SubmitAfterSalesTicketDialog({
  open,
  onClose,
  order,
  onSuccess,
}: SubmitAfterSalesTicketDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [ticketType, setTicketType] = useState<"Return" | "Warranty" | null>(
    null
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const itemsCount = order?.items?.length ?? 0;

  const submitTicketMutation = useMutation({
    mutationFn: async () => {
      if (!order || !ticketType) {
        throw new Error("Missing required fields");
      }

      const ticketTypeEnum = ticketType === "Return" ? 1 : 2;

      const payload = {
        orderId: order.id,
        orderItemIds:
          selectedItemIds.length > 0
            ? selectedItemIds
            : null,
        ticketType: ticketTypeEnum,
        reason,
        requestedAction: null,
        refundAmount: null,
        attachments: uploadedFiles.map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileExtension: f.fileExtension,
        })),
      };

      const res = await agent.post("/me/after-sales", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        "After-sales ticket submitted successfully. Our team will review it shortly."
      );
      handleReset();
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to submit ticket");
      } else {
        toast.error("Failed to submit after-sales ticket");
      }
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await agent.post<{ url: string; publicId: string }>(
        "/uploads/image",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to upload file");
      } else {
        toast.error("Failed to upload file");
      }
    },
  });

  const handleNext = () => {
    if (activeStep === 0) {
      if (!ticketType) {
        toast.error("Please select a ticket type");
        return;
      }
    } else if (activeStep === 2) {
      if (!reason.trim()) {
        toast.error("Please enter a reason");
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setTicketType(null);
    setSelectedItemIds([]);
    setReason("");
    setUploadedFiles([]);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllItems = () => {
    if (selectedItemIds.length === itemsCount) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(
        order?.items?.map((item: any) => item.id) ?? []
      );
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (uploadedFiles.length + files.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        continue;
      }

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          `File ${file.name} has unsupported format. Allowed: images (JPG, PNG, GIF, WebP), videos (MP4, WebM), PDF`
        );
        continue;
      }

      try {
        setUploading(true);
        const uploadResult = await uploadFileMutation.mutateAsync(file);
        const ext = file.name.split(".").pop();
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36),
            fileName: file.name,
            fileUrl: uploadResult.url,
            fileExtension: ext,
          },
        ]);
        toast.success(`${file.name} uploaded successfully`);
      } finally {
        setUploading(false);
      }
    }

    event.target.value = "";
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleClose = () => {
    if (activeStep > 0) {
      if (
        ticketType ||
        selectedItemIds.length > 0 ||
        reason ||
        uploadedFiles.length > 0
      ) {
        const confirmed = globalThis.confirm(
          "Are you sure? Your progress will be lost."
        );
        if (!confirmed) return;
      }
    }
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }
    await submitTicketMutation.mutateAsync();
  };

  const canProceed = () => {
    if (activeStep === 0) return ticketType !== null;
    if (activeStep === 2) return reason.trim().length > 0;
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 18,
          color: PALETTE.textMain,
          borderBottom: `1px solid ${PALETTE.divider}`,
        }}
      >
        Submit Return/Refund or Warranty Ticket
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stepper
          activeStep={activeStep}
          sx={{ mb: 3 }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              fontSize={14}
              sx={{ color: PALETTE.textSecondary, mb: 1 }}
            >
              Select the type of ticket you want to submit:
            </Typography>

            <FormControl fullWidth>
              <RadioGroup
                value={ticketType || ""}
                onChange={(e) =>
                  setTicketType(e.target.value as "Return" | "Warranty")
                }
              >
                <Card sx={{ mb: 1, border: `1px solid ${PALETTE.cardBorder}` }}>
                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 2 } }}>
                    <FormControlLabel
                      value="Return"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography
                            fontWeight={600}
                            fontSize={14}
                            sx={{ color: PALETTE.textMain }}
                          >
                            Return/Refund
                          </Typography>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMuted }}
                          >
                            Return items for a refund or exchange
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>

                <Card sx={{ border: `1px solid ${PALETTE.cardBorder}` }}>
                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 2 } }}>
                    <FormControlLabel
                      value="Warranty"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography
                            fontWeight={600}
                            fontSize={14}
                            sx={{ color: PALETTE.textMain }}
                          >
                            Warranty
                          </Typography>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMuted }}
                          >
                            Report defects covered by warranty
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              fontSize={14}
              sx={{ color: PALETTE.textSecondary, mb: 1 }}
            >
              Select which items to include (leave unchecked for whole order):
            </Typography>

            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedItemIds.length === itemsCount}
                    indeterminate={
                      selectedItemIds.length > 0 &&
                      selectedItemIds.length < itemsCount
                    }
                    onChange={handleSelectAllItems}
                  />
                }
                label={
                  <Typography
                    fontWeight={600}
                    fontSize={14}
                    sx={{ color: PALETTE.textMain }}
                  >
                    Select All
                  </Typography>
                }
              />
            </FormControl>

            <Paper
              sx={{
                border: `1px solid ${PALETTE.cardBorder}`,
                borderRadius: 1,
                maxHeight: 250,
                overflow: "auto",
              }}
            >
              <List sx={{ p: 0 }}>
                {order?.items?.map((item: any, idx: number) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      py: 2,
                      px: 2,
                      borderBottom:
                        idx < (order?.items?.length ?? 0) - 1
                          ? `1px solid ${PALETTE.divider}`
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Checkbox
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        fontSize={14}
                        fontWeight={600}
                        sx={{ color: PALETTE.textMain }}
                      >
                        {item.productName}
                      </Typography>
                      {item.variantName && (
                        <Typography
                          fontSize={13}
                          sx={{ color: PALETTE.textMuted }}
                        >
                          {item.variantName}
                        </Typography>
                      )}
                      <Typography
                        fontSize={12}
                        sx={{ color: PALETTE.textMuted }}
                      >
                        Qty: {item.quantity}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {selectedItemIds.length > 0 && (
              <Box>
                <Typography
                  fontSize={12}
                  sx={{ color: PALETTE.textMuted, mb: 1 }}
                >
                  Selected items:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedItemIds.map((id) => {
                    const item = order?.items?.find(
                      (i: any) => i.id === id
                    );
                    return (
                      <Chip
                        key={id}
                        label={item?.productName}
                        size="small"
                        onDelete={() => handleSelectItem(id)}
                        sx={{
                          bgcolor: `${PALETTE.accent}20`,
                          color: PALETTE.accent,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              fontSize={14}
              sx={{ color: PALETTE.textSecondary, mb: 1 }}
            >
              Please describe the reason for your {ticketType?.toLowerCase()}{" "}
              request:
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the issue, reason, or details..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 14,
                  color: PALETTE.textMain,
                  "& fieldset": { borderColor: PALETTE.cardBorder },
                  "&:hover fieldset": { borderColor: PALETTE.accent },
                  "&.Mui-focused fieldset": { borderColor: PALETTE.accent },
                },
              }}
            />

            <Typography
              fontSize={12}
              sx={{
                color: PALETTE.textMuted,
                textAlign: "right",
              }}
            >
              {reason.length}/500 characters
            </Typography>
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              fontSize={14}
              sx={{ color: PALETTE.textSecondary }}
            >
              Upload photos or videos as proof (max 5 files, 10MB each):
            </Typography>

            {uploadedFiles.length > 0 && (
              <Paper sx={{ border: `1px solid ${PALETTE.cardBorder}`, p: 2 }}>
                <List sx={{ p: 0 }}>
                  {uploadedFiles.map((file, idx) => (
                    <ListItem
                      key={file.id}
                      sx={{
                        py: 1.5,
                        px: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom:
                          idx < uploadedFiles.length - 1
                            ? `1px solid ${PALETTE.divider}`
                            : "none",
                      }}
                    >
                      <Box>
                        <Typography
                          fontSize={14}
                          sx={{ color: PALETTE.textMain }}
                        >
                          {file.fileName}
                        </Typography>
                        <Typography
                          fontSize={12}
                          sx={{ color: PALETTE.textMuted }}
                        >
                          ✓ Uploaded
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handleRemoveFile(file.id)}
                        startIcon={<DeleteIcon />}
                        sx={{ color: "#B91C1C" }}
                      >
                        Remove
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {uploadedFiles.length < 5 && (
              <Box
                sx={{
                  border: `2px dashed ${PALETTE.accent}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: `${PALETTE.accent}10`,
                  },
                  position: "relative",
                }}
                component="label"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,.pdf"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                <CloudUploadIcon
                  sx={{
                    fontSize: 40,
                    color: PALETTE.accent,
                    mb: 1,
                  }}
                />
                <Typography
                  fontWeight={600}
                  fontSize={14}
                  sx={{ color: PALETTE.textMain }}
                >
                  {uploading ? "Uploading..." : "Click to upload or drag"}
                </Typography>
                <Typography
                  fontSize={12}
                  sx={{ color: PALETTE.textMuted, mt: 0.5 }}
                >
                  Images, videos, or PDF ({uploadedFiles.length}/5 uploaded)
                </Typography>
              </Box>
            )}

            {uploadedFiles.length === 5 && (
              <Alert
                severity="info"
                sx={{ fontSize: 12 }}
              >
                Maximum 5 files reached. Remove a file to upload more.
              </Alert>
            )}

            {activeStep === 3 && uploadedFiles.length === 0 && (
              <Alert
                severity="warning"
                sx={{ fontSize: 12 }}
              >
                Uploading evidence photos/videos will help us process your
                request faster.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${PALETTE.divider}`,
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            color: PALETTE.textSecondary,
          }}
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handlePrev}
            sx={{
              textTransform: "none",
              color: PALETTE.accent,
            }}
          >
            Back
          </Button>
        )}

        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || uploading}
            sx={{
              textTransform: "none",
              bgcolor: PALETTE.accent,
              "&:hover": { bgcolor: PALETTE.accentHover },
              "&:disabled": { bgcolor: "#CCCCCC" },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !reason.trim() ||
              submitTicketMutation.isPending ||
              uploading
            }
            sx={{
              textTransform: "none",
              bgcolor: PALETTE.accent,
              "&:hover": { bgcolor: PALETTE.accentHover },
              "&:disabled": { bgcolor: "#CCCCCC" },
            }}
          >
            {submitTicketMutation.isPending ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1, color: "white" }} />
                Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
