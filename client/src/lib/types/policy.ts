/** Policy Type values - can be number or string from API */
export const PolicyTypeEnum = {
  Unknown: 0,
  Return: 1,
  Warranty: 2,
  Refund: 3,
} as const;

export type PolicyTypeEnum = typeof PolicyTypeEnum[keyof typeof PolicyTypeEnum];

/** Map policy type values to labels - handles both numeric and string values from API */
export const POLICY_TYPE_LABELS: Record<number | string, string> = {
  // Numeric values
  0: "Unknown",
  1: "Return",
  2: "Warranty",
  3: "Refund",
  // String values (from API enum serialization)
  "Unknown": "Unknown",
  "Return": "Return",
  "Warranty": "Warranty",
  "Refund": "Refund",
};

/** Get policy type label for display */
export function getPolicyTypeLabel(policyType: number | string | undefined): string {
  if (policyType === undefined || policyType === null) {
    return "Unknown";
  }
  return POLICY_TYPE_LABELS[policyType] || "Unknown";
}

/** Policy Configuration DTO returned from API */
export interface PolicyConfigurationDto {
  id: string;
  policyType: PolicyTypeEnum;
  policyName: string;
  returnWindowDays: number | null;
  warrantyMonths: number | null;
  refundAllowed: boolean;
  customizedLensRefundable: boolean;
  evidenceRequired: boolean;
  minOrderAmount: number | null;
  refundOnlyMaxAmount: number | null;
  refundWindowDays: number | null;
  isActive: boolean;
  effectiveFrom: string; // ISO datetime
  effectiveTo: string | null; // ISO datetime
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/** DTO for creating a new policy */
export interface CreatePolicyPayload {
  policyType: PolicyTypeEnum;
  policyName: string;
  returnWindowDays: number | null;
  warrantyMonths: number | null;
  refundAllowed: boolean;
  customizedLensRefundable: boolean;
  evidenceRequired: boolean;
  minOrderAmount: number | null;
  refundOnlyMaxAmount: number | null;
  refundWindowDays: number | null;
  isActive: boolean;
  effectiveFrom: string; // ISO datetime
  effectiveTo: string | null; // ISO datetime
}

/** DTO for updating an existing policy */
export interface UpdatePolicyPayload {
  policyName: string;
  returnWindowDays: number | null;
  warrantyMonths: number | null;
  refundAllowed: boolean;
  customizedLensRefundable: boolean;
  evidenceRequired: boolean;
  minOrderAmount: number | null;
  refundOnlyMaxAmount: number | null;
  refundWindowDays: number | null;
  isActive: boolean;
  effectiveFrom: string; // ISO datetime
  effectiveTo: string | null; // ISO datetime
}

/** Query params for GET /api/admin/policies */
export interface AdminPoliciesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  policyType?: PolicyTypeEnum | null;
  isActive?: boolean | null;
  search?: string | null;
}

/** Paged response for policies list */
export interface PagedPoliciesResponse {
  items: PolicyConfigurationDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}
