import { useState, useEffect } from "react";
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
  Modal,
  IconButton,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import type { CustomerOrderDetailDto } from "../../lib/types/order";
import agent from "../../lib/api/agent";
import { useTicketsByOrder } from "../../lib/hooks/useAfterSales";

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

const STEPS = ["Ticket Type", "Select Items", "Reason", "Upload Evidence", "Review"];

// Helper function to determine file type
const getFileType = (fileName: string): "image" | "video" | "pdf" | "other" => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExts = ["mp4", "webm"];
  
  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "other";
};

// Helper function to check if file is viewable in preview
const isViewableFile = (fileName: string): boolean => {
  const type = getFileType(fileName);
  return type === "image" || type === "video";
};

export function SubmitAfterSalesTicketDialog({
  open,
  onClose,
  order,
  onSuccess,
}: SubmitAfterSalesTicketDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [ticketType, setTicketType] = useState<"Return" | "Refund" | "Warranty" | null>(
    null
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [itemsInExistingTickets, setItemsInExistingTickets] = useState<Set<string>>(new Set());
  const [refundedItemIds, setRefundedItemIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query existing tickets for this order
  const { data: existingTickets } = useTicketsByOrder(
    order?.id
  );

  // Build set of items already in non-closed tickets
  // Also build set of items that have been refunded (in closed/resolved tickets with refundAmount)
  useEffect(() => {
    if (existingTickets && existingTickets.length > 0) {
      const itemIds = new Set<string>();
      const refundedIds = new Set<string>();
      
      existingTickets.forEach((ticket) => {
        // Items in non-closed tickets are unavailable for new tickets
        const isClosedStatus =
          ticket.ticketStatus === "Resolved" ||
          ticket.ticketStatus === "Rejected" ||
          ticket.ticketStatus === "Closed";
        
        if (!isClosedStatus && ticket.items && ticket.items.length > 0) {
          ticket.items.forEach((item) => {
            itemIds.add(item.id);
          });
        }

        // Items in closed/resolved tickets with refund amount are marked as refunded
        // This includes Return, Warranty, or Refund tickets that resulted in a refund
        const isRefundedStatus =
          ticket.ticketStatus === "Resolved" ||
          ticket.ticketStatus === "Closed";
        
        if (isRefundedStatus && ticket.refundAmount && ticket.refundAmount > 0 && ticket.items && ticket.items.length > 0) {
          ticket.items.forEach((item) => {
            refundedIds.add(item.id);
          });
        }
      });
      
      setItemsInExistingTickets(itemIds);
      setRefundedItemIds(refundedIds);
    } else {
      setItemsInExistingTickets(new Set());
      setRefundedItemIds(new Set());
    }
  }, [existingTickets]);

  const itemsCount = order?.items?.length ?? 0;

  const submitTicketMutation = useMutation({
    mutationFn: async () => {
      if (!order || !ticketType) {
        throw new Error("Missing required fields");
      }

      const ticketTypeMap: Record<string, number> = {
        "Return": 1,
        "Refund": 3,
        "Warranty": 2,
      };
      const ticketTypeEnum = ticketTypeMap[ticketType];

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
      // Invalidate ticket queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["me", "after-sales"] });
      if (order?.id) {
        queryClient.invalidateQueries({ queryKey: ["me", "after-sales", "orders", order.id] });
      }
      setSubmitError(null);
      handleReset();
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      let errorMessage = "Failed to submit your support request. Please try again.";

      if (err instanceof Error) {
        // Axios error with response data
        const axiosErr = err as any;
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        } else if (axiosErr.response?.data?.error) {
          errorMessage = axiosErr.response.data.error;
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message;
        }
      }

      setSubmitError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await agent.post<{ url: string; publicId: string }>(
        "/uploads/image",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
    } else if (activeStep === 1) {
      if (selectedItemIds.length === 0) {
        toast.error("Please select at least one item");
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
    setSubmitError(null);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  const handleSelectItem = (itemId: string) => {
    // Don't allow selecting items that are already in tickets or have been refunded
    if (itemsInExistingTickets.has(itemId) || refundedItemIds.has(itemId)) {
      return;
    }
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllItems = () => {
    const availableItemIds = order?.items
      ?.filter((item: any) => !itemsInExistingTickets.has(item.id) && !refundedItemIds.has(item.id))
      .map((item: any) => item.id) ?? [];

    if (selectedItemIds.length === availableItemIds.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(availableItemIds);
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
    if (activeStep === 1) return selectedItemIds.length > 0;
    if (activeStep === 2) return reason.trim().length > 0;
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
        Submit After-Sales Ticket
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {submitError && (
          <Alert
            severity="error"
            onClose={() => setSubmitError(null)}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Unable to Submit Ticket
            </Typography>
            <Typography variant="body2">
              {submitError}
            </Typography>
          </Alert>
        )}
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
                  setTicketType(e.target.value as "Return" | "Refund" | "Warranty")
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
                            Return
                          </Typography>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMuted }}
                          >
                            Return items to us
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>

                <Card sx={{ mb: 1, border: `1px solid ${PALETTE.cardBorder}` }}>
                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 2 } }}>
                    <FormControlLabel
                      value="Refund"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography
                            fontWeight={600}
                            fontSize={14}
                            sx={{ color: PALETTE.textMain }}
                          >
                            Refund
                          </Typography>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMuted }}
                          >
                            Request a refund for your purchase
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
              Select which items to include:
            </Typography>

            {(itemsInExistingTickets.size > 0 || refundedItemIds.size > 0) && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography fontSize={13} fontWeight={600} sx={{ mb: 0.5 }}>
                  Some items are unavailable
                </Typography>
                <Typography fontSize={13}>
                  {itemsInExistingTickets.size > 0 && (
                    <>Products already in other tickets cannot be selected. </>
                  )}
                  {refundedItemIds.size > 0 && (
                    <>Items marked as "Refunded" cannot be selected as they have already been refunded.</>
                  )}
                  {itemsInExistingTickets.size > 0 && refundedItemIds.size > 0 && (
                    <> Please select different items.</>
                  )}
                </Typography>
              </Alert>
            )}

            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      selectedItemIds.length === (itemsCount - itemsInExistingTickets.size - refundedItemIds.size) &&
                      itemsCount - itemsInExistingTickets.size - refundedItemIds.size > 0
                    }
                    indeterminate={
                      selectedItemIds.length > 0 &&
                      selectedItemIds.length < (itemsCount - itemsInExistingTickets.size - refundedItemIds.size)
                    }
                    onChange={handleSelectAllItems}
                    disabled={itemsInExistingTickets.size + refundedItemIds.size === itemsCount}
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
                {order?.items?.map((item: any, idx: number) => {
                  const isUnavailable = itemsInExistingTickets.has(item.id);
                  const isRefunded = refundedItemIds.has(item.id);
                  const isDisabled = isUnavailable || isRefunded;
                  
                  return (
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
                        opacity: isDisabled ? 0.6 : 1,
                        backgroundColor: isDisabled ? "rgba(0,0,0,0.02)" : "transparent",
                      }}
                    >
                      <Checkbox
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        disabled={isDisabled}
                      />
                      {(item.productImageUrl || item.imageUrl) && (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            flexShrink: 0,
                            borderRadius: 1,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: PALETTE.divider,
                            opacity: isDisabled ? 0.6 : 1,
                            position: "relative",
                          }}
                        >
                          <Box
                            component="img"
                            src={item.productImageUrl || item.imageUrl}
                            alt={item.productName}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {isRefunded && (
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(0,0,0,0.5)",
                              }}
                            >
                              <Typography
                                fontSize={10}
                                fontWeight={700}
                                sx={{
                                  color: "#DC2626",
                                  textAlign: "center",
                                  px: 0.5,
                                }}
                              >
                                REFUNDED
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                        <Box>
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
                          {isRefunded && (
                            <Typography
                              fontSize={12}
                              sx={{ color: "#DC2626", fontWeight: 600, mt: 0.5 }}
                            >
                              Refunded
                            </Typography>
                          )}
                          {isUnavailable && !isRefunded && (
                            <Typography
                              fontSize={12}
                              sx={{ color: "#D97706", fontWeight: 600, mt: 0.5 }}
                            >
                              Already in ticket
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right", minWidth: "fit-content" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 12, color: PALETTE.textMuted, alignItems: "flex-end" }}>
                            <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                              Qty: {item.quantity}
                            </Typography>
                            <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                              ${item.unitPrice?.toFixed(2) || "0.00"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
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
                  {uploadedFiles.map((file, idx) => {
                    const fileType = getFileType(file.fileName);
                    const isViewable = isViewableFile(file.fileName);
                    
                    return (
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                          {fileType === "image" && (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                borderRadius: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: PALETTE.divider,
                                cursor: isViewable ? "pointer" : "default",
                                position: "relative",
                                "&:hover": isViewable ? {
                                  opacity: 0.8,
                                } : {},
                              }}
                              onClick={() => {
                                if (isViewable) {
                                  setPreviewFile(file);
                                  setPreviewOpen(true);
                                }
                              }}
                            >
                              <Box
                                component="img"
                                src={file.fileUrl}
                                alt={file.fileName}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                          )}
                          {fileType === "video" && (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                borderRadius: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: PALETTE.divider,
                                cursor: "pointer",
                                position: "relative",
                                "&:hover": {
                                  opacity: 0.8,
                                },
                              }}
                              onClick={() => {
                                if (isViewable) {
                                  setPreviewFile(file);
                                  setPreviewOpen(true);
                                }
                              }}
                            >
                              <PlayArrowIcon sx={{ fontSize: 32, color: PALETTE.accent }} />
                            </Box>
                          )}
                          {fileType === "pdf" && (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                flexShrink: 0,
                                borderRadius: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: PALETTE.divider,
                              }}
                            >
                              <Typography fontSize={12} sx={{ color: PALETTE.accent, fontWeight: 700 }}>
                                PDF
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              fontSize={14}
                              sx={{ color: PALETTE.textMain, overflow: "hidden", textOverflow: "ellipsis" }}
                              title={file.fileName}
                            >
                              {file.fileName}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                              <Typography
                                fontSize={12}
                                sx={{ color: PALETTE.textMuted }}
                              >
                                ✓ Uploaded
                              </Typography>
                              {isViewable && (
                                <Typography
                                  fontSize={12}
                                  sx={{
                                    color: PALETTE.accent,
                                    cursor: "pointer",
                                    fontWeight: 500,
                                    textDecoration: "underline",
                                  }}
                                  onClick={() => {
                                    setPreviewFile(file);
                                    setPreviewOpen(true);
                                  }}
                                >
                                  View
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          onClick={() => handleRemoveFile(file.id)}
                          startIcon={<DeleteIcon />}
                          sx={{ color: "#B91C1C", flexShrink: 0 }}
                        >
                          Remove
                        </Button>
                      </ListItem>
                    );
                  })}
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

        {activeStep === 4 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              fontSize={14}
              sx={{ color: PALETTE.textSecondary, fontWeight: 600, mb: 1 }}
            >
              Please review your submission before confirming:
            </Typography>

            <Paper sx={{ border: `1px solid ${PALETTE.cardBorder}`, p: 2.5 }}>
              <Typography
                fontSize={12}
                sx={{ color: PALETTE.textMuted, fontWeight: 600, mb: 1 }}
              >
                TICKET TYPE
              </Typography>
              <Typography
                fontSize={14}
                sx={{ color: PALETTE.textMain, fontWeight: 600 }}
              >
                {ticketType}
              </Typography>
            </Paper>

            <Paper sx={{ border: `1px solid ${PALETTE.cardBorder}`, p: 2.5 }}>
              <Typography
                fontSize={12}
                sx={{ color: PALETTE.textMuted, fontWeight: 600, mb: 2 }}
              >
                SELECTED ITEMS ({selectedItemIds.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {selectedItemIds.map((id) => {
                  const item = order?.items?.find((i: any) => i.id === id);
                  return (
                    <Box
                      key={id}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        pb: 1.5,
                        borderBottom: `1px solid ${PALETTE.divider}`,
                        "&:last-child": { borderBottom: "none", pb: 0 },
                      }}
                    >
                      {(item?.productImageUrl || item?.imageUrl) && (
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            flexShrink: 0,
                            borderRadius: 1,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: PALETTE.divider,
                          }}
                        >
                          <Box
                            component="img"
                            src={item?.productImageUrl || item?.imageUrl}
                            alt={item?.productName}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                      <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                        <Box>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMain, fontWeight: 600 }}
                          >
                            {item?.productName}
                          </Typography>
                          {item?.variantName && (
                            <Typography
                              fontSize={12}
                              sx={{ color: PALETTE.textMuted }}
                            >
                              {item?.variantName}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: "right", minWidth: "fit-content" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 12, alignItems: "flex-end" }}>
                            <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                              Qty: {item?.quantity}
                            </Typography>
                            <Typography fontSize={12} sx={{ color: PALETTE.textMuted }}>
                              ${item?.unitPrice?.toFixed(2) || "0.00"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            <Paper sx={{ border: `1px solid ${PALETTE.cardBorder}`, p: 2.5 }}>
              <Typography
                fontSize={12}
                sx={{ color: PALETTE.textMuted, fontWeight: 600, mb: 1 }}
              >
                REASON
              </Typography>
              <Typography
                fontSize={13}
                sx={{ color: PALETTE.textMain, whiteSpace: "pre-wrap" }}
              >
                {reason}
              </Typography>
            </Paper>

            {uploadedFiles.length > 0 && (
              <Paper sx={{ border: `1px solid ${PALETTE.cardBorder}`, p: 2.5 }}>
                <Typography
                  fontSize={12}
                  sx={{ color: PALETTE.textMuted, fontWeight: 600, mb: 2 }}
                >
                  UPLOADED EVIDENCE ({uploadedFiles.length}/5)
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {uploadedFiles.map((file, idx) => {
                    const fileType = getFileType(file.fileName);
                    const isViewable = isViewableFile(file.fileName);
                    
                    return (
                      <Box
                        key={file.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          pb: 1.5,
                          borderBottom:
                            idx < uploadedFiles.length - 1
                              ? `1px solid ${PALETTE.divider}`
                              : "none",
                          "&:last-child": { pb: 0 },
                        }}
                      >
                        {fileType === "image" && (
                          <Box
                            sx={{
                              width: 45,
                              height: 45,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: PALETTE.divider,
                              cursor: isViewable ? "pointer" : "default",
                              "&:hover": isViewable ? {
                                opacity: 0.8,
                              } : {},
                            }}
                            onClick={() => {
                              if (isViewable) {
                                setPreviewFile(file);
                                setPreviewOpen(true);
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={file.fileUrl}
                              alt={file.fileName}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        )}
                        {fileType === "video" && (
                          <Box
                            sx={{
                              width: 45,
                              height: 45,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: PALETTE.divider,
                              cursor: "pointer",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                            onClick={() => {
                              if (isViewable) {
                                setPreviewFile(file);
                                setPreviewOpen(true);
                              }
                            }}
                          >
                            <PlayArrowIcon sx={{ fontSize: 28, color: PALETTE.accent }} />
                          </Box>
                        )}
                        {fileType === "pdf" && (
                          <Box
                            sx={{
                              width: 45,
                              height: 45,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: PALETTE.divider,
                            }}
                          >
                            <Typography fontSize={10} sx={{ color: PALETTE.accent, fontWeight: 700 }}>
                              PDF
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            fontSize={13}
                            sx={{ color: PALETTE.textMain, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                            title={file.fileName}
                          >
                            ✓ {file.fileName}
                          </Typography>
                          {isViewable && (
                            <Typography
                              fontSize={12}
                              sx={{
                                color: PALETTE.accent,
                                cursor: "pointer",
                                fontWeight: 500,
                              }}
                              onClick={() => {
                                setPreviewFile(file);
                                setPreviewOpen(true);
                              }}
                            >
                              Click to view
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Preview Modal */}
      {previewFile && (
        <Modal
          open={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewFile(null);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.95)",
              borderRadius: 2,
              outline: "none",
            }}
          >
            <IconButton
              onClick={() => {
                setPreviewOpen(false);
                setPreviewFile(null);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {getFileType(previewFile.fileName) === "image" && (
              <Box
                component="img"
                src={previewFile.fileUrl}
                alt={previewFile.fileName}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            )}

            {getFileType(previewFile.fileName) === "video" && (
              <Box
                component="video"
                src={previewFile.fileUrl}
                controls
                autoPlay
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            )}

            <Typography
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                color: "white",
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={previewFile.fileName}
            >
              {previewFile.fileName}
            </Typography>
          </Box>
        </Modal>
      )}

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
