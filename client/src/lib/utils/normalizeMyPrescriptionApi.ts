import type {
  MyPrescriptionDetailRowDto,
  MyPrescriptionDto,
  MyPrescriptionListItemDto,
  MyPrescriptionsPageDto,
} from "../types/myPrescriptions";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function pickNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v * 100) / 100;
  const n = parseFloat(String(v).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

export function normalizeMyPrescriptionsPage(raw: unknown): MyPrescriptionsPageDto {
  if (!isRecord(raw)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const itemsRaw = raw.items ?? raw.Items;
  const list = Array.isArray(itemsRaw) ? itemsRaw : [];

  const items: MyPrescriptionListItemDto[] = list.map((row) => {
    const r = isRecord(row) ? row : {};
    return {
      id: String(r.id ?? r.Id ?? ""),
      orderId: String(r.orderId ?? r.OrderId ?? ""),
      orderType: (r.orderType ?? r.OrderType ?? null) as string | null,
      isVerified: Boolean(r.isVerified ?? r.IsVerified ?? false),
      verifiedAt: (r.verifiedAt ?? r.VerifiedAt ?? null) as string | null,
      createdAt: String(r.createdAt ?? r.CreatedAt ?? ""),
      detailCount: Number(r.detailCount ?? r.DetailCount ?? 0),
    };
  });

  return {
    items,
    totalCount: Number(raw.totalCount ?? raw.TotalCount ?? 0),
    pageNumber: Number(raw.pageNumber ?? raw.PageNumber ?? 1),
    pageSize: Number(raw.pageSize ?? raw.PageSize ?? 10),
    totalPages: Number(raw.totalPages ?? raw.TotalPages ?? 0),
    hasPreviousPage: Boolean(raw.hasPreviousPage ?? raw.HasPreviousPage ?? false),
    hasNextPage: Boolean(raw.hasNextPage ?? raw.HasNextPage ?? false),
  };
}

function normalizeDetailRow(raw: unknown): MyPrescriptionDetailRowDto {
  const r = isRecord(raw) ? raw : {};
  const axRaw = r.axis ?? r.AXIS;
  let axis: number | null = null;
  if (axRaw != null) {
    const n = typeof axRaw === "number" ? axRaw : parseFloat(String(axRaw));
    if (Number.isFinite(n)) axis = Math.round(n);
  }
  return {
    id: String(r.id ?? r.Id ?? ""),
    eye: (r.eye ?? r.Eye ?? null) as string | null,
    sph: pickNum(r.sph ?? r.SPH),
    cyl: pickNum(r.cyl ?? r.CYL),
    axis,
    pd: pickNum(r.pd ?? r.PD),
    add: pickNum(r.add ?? r.ADD),
  };
}

export function normalizeMyPrescriptionDto(raw: unknown): MyPrescriptionDto {
  if (!isRecord(raw)) {
    return {
      id: "",
      orderId: "",
      isVerified: false,
      createdAt: "",
      details: [],
    };
  }

  const detailsRaw = raw.details ?? raw.Details;
  const rows = Array.isArray(detailsRaw) ? detailsRaw.map(normalizeDetailRow) : [];

  return {
    id: String(raw.id ?? raw.Id ?? ""),
    orderId: String(raw.orderId ?? raw.OrderId ?? ""),
    orderType: (raw.orderType ?? raw.OrderType ?? null) as string | null,
    isVerified: Boolean(raw.isVerified ?? raw.IsVerified ?? false),
    verifiedAt: (raw.verifiedAt ?? raw.VerifiedAt ?? null) as string | null,
    verificationNotes: (raw.verificationNotes ?? raw.VerificationNotes ?? null) as string | null,
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    imageUrl: (raw.imageUrl ?? raw.ImageUrl ?? null) as string | null,
    details: rows,
  };
}
