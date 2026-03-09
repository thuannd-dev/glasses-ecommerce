import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

export interface InboundRecordItemDto {
  id: string;
  productVariantId: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  notes: string | null;
}

export interface InboundRecordDetailDto {
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
  items: InboundRecordItemDto[];
}

export function useManagerInboundDetail(id: string | undefined) {
  return useQuery<InboundRecordDetailDto>({
    queryKey: ["manager-inbound-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await agent.get<InboundRecordDetailDto>(
        `/manager/inventory/inbound/${id}`
      );
      return res.data;
    },
  });
}
