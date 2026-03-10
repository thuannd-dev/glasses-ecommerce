import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

export interface InboundRecordItemDto {
  id: string;
  productVariantId: string;
  productVariantName: string | null;
  quantity: number;
  unitPrice: number | null;
  notes: string | null;
}

export interface InboundRecordDto {
  id: string;
  sourceType: string;
  sourceReference: string | null;
  status: string;
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

export function useInboundDetail(id: string | undefined) {
  return useQuery<InboundRecordDto>({
    queryKey: ["inbound-detail", id],
    queryFn: async () => {
      const res = await agent.get<InboundRecordDto>(`/manager/inventory/inbound/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
