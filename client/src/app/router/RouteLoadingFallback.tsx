import type { ReactElement } from "react";

export default function RouteLoadingFallback(): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
        color: "#4b5563",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "9999px",
          border: "3px solid #d1d5db",
          borderTopColor: "#1f2937",
          animation: "route-loading-spin 0.8s linear infinite",
        }}
      />
      <span style={{ fontSize: "13px", fontWeight: 600 }}>Loading page...</span>
      <style>
        {
          "@keyframes route-loading-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"
        }
      </style>
    </div>
  );
}
