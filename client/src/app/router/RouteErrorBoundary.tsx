import { useEffect } from "react";
import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

const isDevelopment = import.meta.env.DEV;

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Integrate error tracking service (e.g., Sentry) in production
    // if (!isDevelopment) {
    //   Sentry.captureException(error, {
    //     tags: { errorBoundary: "route" },
    //     contexts: { route: { path: window.location.pathname } }
    //   });
    // }
    console.error("Route Error:", error);
  }, [error]);

  const handleRefresh = (): void => {
    window.location.reload();
  };

  const handleGoHome = (): void => {
    navigate("/");
  };

  // Handle chunk loading errors (dynamic import failures)
  // Covers Vite, Webpack, and various browser error messages
  const isChunkLoadError =
    error instanceof Error &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed") ||
      error.message.includes("Loading chunk") ||
      error.message.includes("ChunkLoadError") ||
      error.name === "ChunkLoadError" ||
      (error.message.includes("Failed to fetch") &&
        error.message.includes("module")));

  if (isChunkLoadError) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: "warning.main",
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom>
              New Update Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The application has been updated. Please refresh the page to load
              the latest version.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
            >
              Go Home
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  // Handle other route errors
  let errorMessage = "An unexpected error occurred";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    // In production, sanitize error messages to avoid exposing implementation details
    errorMessage = isDevelopment
      ? error.message
      : "Something went wrong. Please try again or contact support if the problem persists.";
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: "error.main",
              mb: 2,
            }}
          />
          <Typography variant="h4" gutterBottom>
            Error {errorStatus}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {errorMessage}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
