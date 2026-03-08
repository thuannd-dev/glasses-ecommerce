import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";

export type InboundRecordStatus = "PendingApproval" | "Approved" | "Rejected";

export interface InboundRecordListItem {
  id: string;
  sourceType: string;
  sourceReference: string | null;
  status: InboundRecordStatus;
  totalItems: number;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
}

export interface PagedInboundRecordsResponse {
  items: InboundRecordListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetInboundRecordsParams {
  pageNumber?: number;
  pageSize?: number;
  status?: InboundRecordStatus;
}

export function useManagerInboundRecords(params?: GetInboundRecordsParams) {
  return useQuery<PagedInboundRecordsResponse>({
    queryKey: ["manager-inbound-records", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
      if (params?.status) queryParams.append("status", params.status);

      const res = await agent.get<PagedInboundRecordsResponse>(
        `/manager/inventory/inbound?${queryParams.toString()}`
      );
      return res.data;
    },
  });
}
