import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import { MessageCircle, X, Send, Glasses, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  getAIResponse,
  type RecommendedProduct,
  type ChatbotResponse,
} from "./services/openaiService";

// ── Messenger-style typing dots ──
function TypingDots() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: "rgba(17,24,39,0.35)",
            animation: "chatDotBounce 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            "@keyframes chatDotBounce": {
              "0%, 60%, 100%": { transform: "translateY(0)" },
              "30%": { transform: "translateY(-5px)" },
            },
          }}
        />
      ))}
    </Box>
  );
}

// ── Types ──
type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  products?: RecommendedProduct[];
};

const QUICK_SUGGESTIONS = [
  "Recommend sunglasses",
  "Lightweight everyday frames",
  "Trendy fashion glasses",
  "Best for round face",
];

const GREETING_MESSAGE: Message = {
  id: "greeting",
  text: "Welcome to Lumina Eyewear! I'm your personal glasses consultant. Whether you need sunglasses, prescription frames, or fashion eyewear — I'm here to help you find the perfect pair.\n\nWhat are you looking for today?",
  sender: "ai",
};

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen, scrollToBottom]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse: ChatbotResponse = await getAIResponse(text);

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        sender: "ai",
        products:
          aiResponse.products.length > 0 ? aiResponse.products : undefined,
      };
      setMessages((prev) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI response error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, something went wrong. Please try again in a moment.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleProductClick = (product: RecommendedProduct) => {
    const url = product.detail_url;
    if (url.startsWith("/")) {
      navigate(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ marginBottom: 12 }}
          >
            <Box
              sx={{
                width: { xs: "calc(100vw - 32px)", sm: 400 },
                height: 580,
                maxHeight: "calc(100vh - 120px)",
                bgcolor: "#fff",
                borderRadius: 4,
                boxShadow: "0 25px 60px -12px rgba(17,24,39,0.28), 0 0 0 1px rgba(17,24,39,0.06)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* ── Header ── */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                  color: "#fff",
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Glasses size={18} color="#fff" />
                  </Box>
                  <Box>
                    <Typography
                      sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, letterSpacing: "-0.01em" }}
                    >
                      Lumina Eyewear Assistant
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 6,
                          height: 6,
                          bgcolor: "#34d399",
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      />
                      Online — ready to help
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}
                >
                  <X size={18} />
                </IconButton>
              </Box>

              {/* ── Messages ── */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: 2,
                  py: 2.5,
                  bgcolor: "#f9fafb",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(17,24,39,0.15)",
                    borderRadius: 2,
                  },
                }}
              >
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    {msg.sender === "ai" && (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          bgcolor: "#111827",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 0.3,
                        }}
                      >
                        <Glasses size={13} color="#fff" />
                      </Box>
                    )}
                    <Box sx={{ maxWidth: "80%" }}>
                      <Box
                        sx={{
                          px: 1.8,
                          py: 1.2,
                          fontSize: 13.5,
                          lineHeight: 1.65,
                          whiteSpace: "pre-line",
                          ...(msg.sender === "user"
                            ? {
                                bgcolor: "#111827",
                                color: "#fff",
                                borderRadius: "18px 18px 4px 18px",
                              }
                            : {
                                bgcolor: "#fff",
                                color: "#1f2937",
                                border: "1px solid rgba(17,24,39,0.08)",
                                borderRadius: "18px 18px 18px 4px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              }),
                        }}
                      >
                        {msg.text}
                      </Box>

                      {/* ── Product Cards ── */}
                      {msg.products && msg.products.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {msg.products.map((product) => (
                            <Box
                              key={product.id}
                              sx={{
                                bgcolor: "#fff",
                                border: "1px solid rgba(17,24,39,0.08)",
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  boxShadow: "0 4px 16px rgba(17,24,39,0.1)",
                                  borderColor: "rgba(17,24,39,0.15)",
                                },
                              }}
                              onClick={() => handleProductClick(product)}
                            >
                              {product.image && (
                                <Box
                                  component="img"
                                  src={product.image}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  sx={{
                                    width: "100%",
                                    height: 110,
                                    objectFit: "cover",
                                    bgcolor: "#f3f4f6",
                                  }}
                                />
                              )}
                              <Box sx={{ p: 1.5 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                    color: "#111827",
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {product.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: "#111827",
                                    mt: 0.3,
                                  }}
                                >
                                  {product.price}
                                </Typography>
                                {product.short_description && (
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      color: "rgba(17,24,39,0.55)",
                                      mt: 0.5,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {product.short_description}
                                  </Typography>
                                )}
                                <Box
                                  sx={{
                                    mt: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 0.5,
                                    py: 0.7,
                                    bgcolor: "#111827",
                                    color: "#fff",
                                    borderRadius: 2,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    transition: "background 0.2s",
                                    "&:hover": { bgcolor: "#1f2937" },
                                  }}
                                >
                                  View Product{" "}
                                  <ExternalLink size={11} />
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}

                {/* ── Messenger-style typing indicator ── */}
                {isTyping && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        flexShrink: 0,
                        bgcolor: "#111827",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 0.3,
                      }}
                    >
                      <Glasses size={13} color="#fff" />
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.4,
                        borderRadius: "18px 18px 18px 4px",
                        bgcolor: "#fff",
                        border: "1px solid rgba(17,24,39,0.08)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <TypingDots />
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* ── Quick suggestions ── */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: "#fff",
                  borderTop: "1px solid rgba(17,24,39,0.06)",
                  flexShrink: 0,
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                    <Box
                      key={idx}
                      component="button"
                      onClick={() => handleSendMessage(suggestion)}
                      sx={{
                        px: 1.4,
                        py: 0.5,
                        bgcolor: "transparent",
                        border: "1px solid rgba(17,24,39,0.12)",
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#374151",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s",
                        "&:hover": { bgcolor: "#111827", color: "#fff", borderColor: "#111827" },
                      }}
                    >
                      {suggestion}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* ── Input ── */}
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                sx={{
                  px: 1.5,
                  py: 1.2,
                  bgcolor: "#fff",
                  borderTop: "1px solid rgba(17,24,39,0.06)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about glasses..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      fontSize: 13.5,
                      bgcolor: "#f9fafb",
                      "& fieldset": { borderColor: "rgba(17,24,39,0.10)" },
                      "&:hover fieldset": { borderColor: "rgba(17,24,39,0.20)" },
                      "&.Mui-focused fieldset": { borderColor: "#111827" },
                    },
                  }}
                />
                <IconButton
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  sx={{
                    bgcolor: "#111827",
                    color: "#fff",
                    width: 36,
                    height: 36,
                    "&:hover": { bgcolor: "#1f2937" },
                    "&.Mui-disabled": {
                      bgcolor: "rgba(17,24,39,0.15)",
                      color: "rgba(17,24,39,0.3)",
                    },
                  }}
                >
                  <Send size={15} />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 56,
            height: 56,
            bgcolor: "#111827",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(17,24,39,0.3)",
            "&:hover": { bgcolor: "#1f2937" },
          }}
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </IconButton>
      </motion.div>
    </Box>
  );
}
