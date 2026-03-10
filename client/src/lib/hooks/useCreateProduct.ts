import { useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export interface CreateProductDto {
  categoryId: string;  // GUID string format (will be converted by backend)
  productName: string;
  type: number;  // ProductType enum: 0=Unknown, 1=Frame, 2=Lens, 3=Combo, 4=Accessory, 5=Service
  description: string | null;
  brand: string | null;
  status: number;  // ProductStatus enum: 0=Active, 1=Inactive, 2=Draft
}

/** Hook để tạo mới một Product */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      console.log("Sending request to /manager/products with data:", data);
      // Response is just a GUID string, not an object with id property
      const response = await agent.post<string>("/manager/products", data);
      console.log("Response from server:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Product created with ID:", data);
      // Invalidate products queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ["manager-products"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
}
