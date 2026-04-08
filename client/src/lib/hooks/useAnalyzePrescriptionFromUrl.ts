import { useMutation } from "@tanstack/react-query";

import agent from "../api/agent";
import type { PrescriptionOcrResultDto } from "../types/prescriptionOcr";

export type AnalyzePrescriptionPayload = {
    imageUrl: string;
    publicId: string;
};

/**
 * OCR + parse prescription values from an image already uploaded (POST /api/uploads/prescription/analyze-url).
 */
export function useAnalyzePrescriptionFromUrl() {
    return useMutation({
        mutationFn: async (payload: AnalyzePrescriptionPayload): Promise<PrescriptionOcrResultDto> => {
            const res = await agent.post<PrescriptionOcrResultDto>(
                "/uploads/prescription/analyze-url",
                payload,
                { headers: { "Content-Type": "application/json" } },
            );
            return res.data;
        },
    });
}
