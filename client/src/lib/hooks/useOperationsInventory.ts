import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type { ProductsApiResponse } from "../types/product";

export interface InventoryAdjustPayload {
  productVariantId: string;
  quantity: number;
  notes?: string;
  sourceType?: string;
}

export interface InventoryOutboundPayload {
  orderId: string;
  notes?: string;
}

export interface InventoryCatalogItem {
  id: string;
  productName: string;
  brand: string;
  totalQuantityAvailable: number;
  minPrice: number;
  maxPrice: number;
}

export interface InventoryCatalogParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface InventoryCatalogResponse {
  items: InventoryCatalogItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryTransactionItem {
  id: string;
  productVariantId: string;
  variantName: string | null;
  sku: string | null;
  transactionType: string;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  status: string | null;
  notes: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface InventoryTransactionsParams {
  pageNumber?: number;
  pageSize?: number;
  transactionType?: string;
  referenceType?: string;
  productVariantId?: string;
}

export interface InventoryTransactionsResponse {
  items: InventoryTransactionItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InventoryRecordDetailItem {
  id: string;
  productVariantId: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  notes: string | null;
}

export interface InventoryRecordDetail {
  id: string;
  sourceType: string | null;
  sourceReference: string | null;
  status: string | null;
  totalItems: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  approvedByName: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  items: InventoryRecordDetailItem[];
}

export interface InventoryInboundRecordItem {
  id: string;
  sourceType: string | null;
  sourceReference: string | null;
  status: string | null;
  totalItems: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

export interface InventoryInboundRecordsParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

export interface InventoryInboundRecordsResponse {
  items: InventoryInboundRecordItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface InventoryOutboundRecordItem {
  orderId: string;
  orderNumber: string | null;
  orderStatus: string | null;
  customerName: string | null;
  totalItems: number;
  totalQuantity: number;
  recordedAt: string;
  recordedByName: string | null;
}

export interface InventoryOutboundRecordDetailItem {
  id: string;
  productVariantId: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  notes: string | null;
}

export interface InventoryOutboundRecordDetail {
  orderId: string;
  orderNumber: string | null;
  orderStatus: string | null;
  customerName: string | null;
  totalItems: number;
  totalQuantity: number;
  recordedAt: string;
  recordedBy: string | null;
  recordedByName: string | null;
  items: InventoryOutboundRecordDetailItem[];
}

export interface InventoryOutboundRecordsParams {
  pageNumber?: number;
  pageSize?: number;
  orderId?: string;
}

export interface InventoryOutboundRecordsResponse {
  items: InventoryOutboundRecordItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PreOrderSummaryItemDto {
  productId: string;
  productName: string;
  brand?: string;
  variantId: string;
  variantName?: string;
  sku: string;
  quantityPreOrdered: number;
  quantityReserved: number;
  quantityPending: number;
  isPreOrderVariant: boolean;
}

export interface PreOrderSummaryResponseDto {
  totalPreOrderVariants: number;
  totalPreOrderDemand: number;
  totalFulfilledQuantity: number;
  totalPendingQuantity: number;
  items: PreOrderSummaryItemDto[];
}

async function createInbound(payload: InventoryAdjustPayload): Promise<unknown> {
  const normalizedNotes = payload.notes?.trim() || null;
  const normalizedSourceType = payload.sourceType?.trim() || "Supplier";
  const itemPayload = {
    productVariantId: payload.productVariantId,
    ProductVariantId: payload.productVariantId,
    variantId: payload.productVariantId,
    VariantId: payload.productVariantId,
    quantity: payload.quantity,
    Quantity: payload.quantity,
  };
  const dtoPayload = {
    sourceType: normalizedSourceType,
    SourceType: normalizedSourceType,
    items: [itemPayload],
    Items: [itemPayload],
    notes: normalizedNotes,
    Notes: normalizedNotes,
    note: normalizedNotes,
  };

  const res = await agent.post("/operations/inventory/inbound", {
    // Keep backward-compatible fields while matching backend DTO contract.
    dto: dtoPayload,
    Dto: dtoPayload,
    sourceType: dtoPayload.sourceType,
    SourceType: dtoPayload.sourceType,
    items: dtoPayload.items,
    Items: dtoPayload.items,
    notes: normalizedNotes,
    Notes: normalizedNotes,
    note: normalizedNotes,
    productVariantId: payload.productVariantId,
    ProductVariantId: payload.productVariantId,
    quantity: payload.quantity,
    Quantity: payload.quantity,
  });
  return res.data;
}

async function createOutbound(payload: InventoryOutboundPayload): Promise<unknown> {
  const normalizedNotes = payload.notes?.trim() || null;

  const res = await agent.post("/operations/inventory/outbound", {
    orderId: payload.orderId,
    OrderId: payload.orderId,
    notes: normalizedNotes,
    Notes: normalizedNotes,
    note: normalizedNotes,
  });
  return res.data;
}

async function fetchInventoryCatalog(
  params: InventoryCatalogParams = {},
): Promise<InventoryCatalogResponse> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 12;

  const res = await agent.get<ProductsApiResponse>("/products", {
    params: {
      pageNumber,
      pageSize,
      search: params.search?.trim() || undefined,
    },
  });

  const data = res.data;
  const rawItems = Array.isArray(data?.items) ? data.items : [];

  const items: InventoryCatalogItem[] = rawItems.map((item) => ({
    id: item.id,
    productName: item.productName,
    brand: item.brand,
    totalQuantityAvailable: item.totalQuantityAvailable ?? 0,
    minPrice: item.minPrice ?? 0,
    maxPrice: item.maxPrice ?? 0,
  }));

  return {
    items,
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? pageNumber,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize)),
  };
}

async function fetchInventoryTransactions(
  params: InventoryTransactionsParams = {},
): Promise<InventoryTransactionsResponse> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 10;
  const res = await agent.get<InventoryTransactionsResponse>("/operations/inventory/transactions", {
    params: {
      pageNumber,
      pageSize,
      transactionType: params.transactionType || undefined,
      referenceType: params.referenceType || undefined,
      productVariantId: params.productVariantId || undefined,
    },
  });
  const data = res.data;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? pageNumber,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 1,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    hasNextPage: data?.hasNextPage ?? false,
  };
}

async function fetchInventoryRecordDetail(id: string): Promise<InventoryRecordDetail> {
  const res = await agent.get<InventoryRecordDetail>(`/operations/inventory/inbound/${id}`);
  const data = res.data;
  return {
    id: data?.id ?? id,
    sourceType: data?.sourceType ?? null,
    sourceReference: data?.sourceReference ?? null,
    status: data?.status ?? null,
    totalItems: data?.totalItems ?? 0,
    notes: data?.notes ?? null,
    createdAt: data?.createdAt ?? "",
    createdBy: data?.createdBy ?? null,
    createdByName: data?.createdByName ?? null,
    approvedAt: data?.approvedAt ?? null,
    approvedBy: data?.approvedBy ?? null,
    approvedByName: data?.approvedByName ?? null,
    rejectedAt: data?.rejectedAt ?? null,
    rejectionReason: data?.rejectionReason ?? null,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

async function fetchInventoryInboundRecords(
  params: InventoryInboundRecordsParams = {},
): Promise<InventoryInboundRecordsResponse> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 10;
  const res = await agent.get<InventoryInboundRecordsResponse>("/operations/inventory/inbound", {
    params: {
      pageNumber,
      pageSize,
      status: params.status || undefined,
    },
  });
  const data = res.data;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? pageNumber,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 1,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    hasNextPage: data?.hasNextPage ?? false,
  };
}

async function fetchInventoryOutboundRecords(
  params: InventoryOutboundRecordsParams = {},
): Promise<InventoryOutboundRecordsResponse> {
  const pageNumber = params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 10;
  const res = await agent.get<InventoryOutboundRecordsResponse>("/operations/inventory/outbound", {
    params: {
      pageNumber,
      pageSize,
      orderId: params.orderId || undefined,
    },
  });
  const data = res.data;
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? pageNumber,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 1,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    hasNextPage: data?.hasNextPage ?? false,
  };
}

async function fetchInventoryOutboundDetail(
  orderId: string,
): Promise<InventoryOutboundRecordDetail> {
  const res = await agent.get<InventoryOutboundRecordDetail>(
    `/operations/inventory/outbound/${orderId}`,
  );
  const data = res.data;
  return {
    orderId: data?.orderId ?? orderId,
    orderNumber: data?.orderNumber ?? null,
    orderStatus: data?.orderStatus ?? null,
    customerName: data?.customerName ?? null,
    totalItems: data?.totalItems ?? 0,
    totalQuantity: data?.totalQuantity ?? 0,
    recordedAt: data?.recordedAt ?? "",
    recordedBy: data?.recordedBy ?? null,
    recordedByName: data?.recordedByName ?? null,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

async function fetchPreOrderSummary(
  includeEmptyPreOrders: boolean = false,
): Promise<PreOrderSummaryResponseDto> {
  const res = await agent.get<PreOrderSummaryResponseDto>(
    "/manager/inventory/preorder-summary",
    {
      params: {
        includeEmptyPreOrders,
      },
    },
  );
  const data = res.data;
  return {
    totalPreOrderVariants: data?.totalPreOrderVariants ?? 0,
    totalPreOrderDemand: data?.totalPreOrderDemand ?? 0,
    totalFulfilledQuantity: data?.totalFulfilledQuantity ?? 0,
    totalPendingQuantity: data?.totalPendingQuantity ?? 0,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

export function useInventoryCatalog(params: InventoryCatalogParams = {}) {
  return useQuery({
    queryKey: ["operations", "inventory", "catalog", params],
    queryFn: () => fetchInventoryCatalog(params),
  });
}

export function useInventoryTransactions(params: InventoryTransactionsParams = {}) {
  return useQuery({
    queryKey: ["operations", "inventory", "transactions", params],
    queryFn: () => fetchInventoryTransactions(params),
  });
}

export function useInventoryRecordDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["operations", "inventory", "inbound-record-detail", id],
    queryFn: () => fetchInventoryRecordDetail(id!),
    enabled: !!id,
  });
}

export function useInventoryInboundRecords(params: InventoryInboundRecordsParams = {}) {
  return useQuery({
    queryKey: ["operations", "inventory", "inbound-records", params],
    queryFn: () => fetchInventoryInboundRecords(params),
  });
}

export function useCreateInventoryInbound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryAdjustPayload) => createInbound(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "inventory"] });
    },
  });
}

export function useCreateInventoryOutbound() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryOutboundPayload) => createOutbound(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", "inventory"] });
    },
  });
}


export function useInventoryOutboundRecords(params: InventoryOutboundRecordsParams = {}) {
  return useQuery({
    queryKey: ['operations', 'inventory', 'outbound-records', params],
    queryFn: () => fetchInventoryOutboundRecords(params),
  });
}

export function useInventoryOutboundDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ['operations', 'inventory', 'outbound-detail', orderId],
    queryFn: () => (orderId ? fetchInventoryOutboundDetail(orderId) : Promise.resolve({} as InventoryOutboundRecordDetail)),
    enabled: !!orderId,
  });
}

export function usePreOrderSummary(includeEmptyPreOrders: boolean = false) {
  return useQuery({
    queryKey: ['manager', 'inventory', 'preorder-summary', includeEmptyPreOrders],
    queryFn: () => fetchPreOrderSummary(includeEmptyPreOrders),
  });
}
