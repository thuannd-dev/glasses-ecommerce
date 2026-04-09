import type { CreatePolicyPayload, CreateFeatureTogglePayload } from "../../lib/types";
import { PolicyTypeEnum } from "../../lib/types";

// ===== POLICY CONSTANTS =====
export const POLICY_TYPES = [
  { value: 1, label: "Return", color: "info" },
  { value: 2, label: "Warranty", color: "warning" },
  { value: 3, label: "Refund", color: "error" },
];

export const POLICY_TYPE_COLORS: Record<number, string> = {
  1: "#1976d2",
  2: "#f57c00",
  3: "#d32f2f",
  0: "#757575",
};

export const INITIAL_POLICY_FORM_STATE: CreatePolicyPayload = {
  policyType: PolicyTypeEnum.Return,
  policyName: "",
  returnWindowDays: null,
  warrantyMonths: null,
  refundAllowed: true,
  customizedLensRefundable: false,
  evidenceRequired: true,
  minOrderAmount: null,
  refundOnlyMaxAmount: null,
  refundWindowDays: null,
  isActive: true,
  effectiveFrom: new Date().toISOString().split("T")[0],
  effectiveTo: null,
};

// ===== FEATURE TOGGLE FORM STATE =====
export const INITIAL_FEATURE_TOGGLE_FORM_STATE: CreateFeatureTogglePayload = {
  featureName: "",
  description: "",
  isEnabled: true,
  scope: null,
  scopeValue: null,
  effectiveFrom: null,
  effectiveTo: null,
};
