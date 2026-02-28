import { useQuery } from "@tanstack/react-query";
import agent from "../api/agent";
import type { LookupsResponse } from "../types/lookups";

const QUERY_KEY_LOOKUPS = ["lookups"];

/** GET /api/lookups — fetch valid enum values for orderType, paymentMethod, etc. */
export function useLookups() {
  return useQuery<LookupsResponse>({
    queryKey: QUERY_KEY_LOOKUPS,
    queryFn: async () => {
      const res = await agent.get<LookupsResponse>("/lookups");
      return res.data;
    },
  });
}
