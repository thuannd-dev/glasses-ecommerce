/** GET /api/me/prescriptions — paged list */
export interface MyPrescriptionListItemDto {
  id: string;
  orderId: string;
  orderType?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  detailCount: number;
}

export interface MyPrescriptionsPageDto {
  items: MyPrescriptionListItemDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** GET /api/me/prescriptions/{id} */
export interface MyPrescriptionDetailRowDto {
  id: string;
  eye?: string | null;
  sph?: number | null;
  cyl?: number | null;
  axis?: number | null;
  pd?: number | null;
  add?: number | null;
}

export interface MyPrescriptionDto {
  id: string;
  orderId: string;
  orderType?: string | null;
  isVerified: boolean;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  createdAt: string;
  imageUrl?: string | null;
  details: MyPrescriptionDetailRowDto[];
}
