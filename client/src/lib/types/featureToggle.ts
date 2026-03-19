export interface FeatureToggleDto {
  id: string;
  featureName: string;
  isEnabled: boolean;
  description: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  scope: string | null;
  scopeValue: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface CreateFeatureTogglePayload {
  featureName: string;
  description?: string | null;
  isEnabled?: boolean;
  scope?: string | null;
  scopeValue?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface UpdateFeatureTogglePayload {
  featureName: string;
  description?: string | null;
  isEnabled: boolean;
  scope?: string | null;
  scopeValue?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface SetFeatureToggleEnabledPayload {
  isEnabled: boolean;
}

export interface AdminFeatureTogglesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  isEnabled?: boolean | null;
  scope?: string | null;
  search?: string | null;
}

export interface PagedFeatureTogglesResponse {
  items: FeatureToggleDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
