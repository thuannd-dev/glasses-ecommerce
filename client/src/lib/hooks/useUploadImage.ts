import { useMutation } from "@tanstack/react-query";

import agent from "../api/agent";

/** Response from POST /api/uploads/image */
export type ImageUploadResult = {
    url: string;
    publicId: string;
};

/**
 * Upload a single image to cloud storage (Cloudinary) via API.
 * Does not validate file type/size — do that in the caller.
 */
export function useUploadImage() {
    return useMutation({
        mutationFn: async (file: File): Promise<ImageUploadResult> => {
            const form = new FormData();
            form.append("file", file);
            const res = await agent.post<ImageUploadResult>("/uploads/image", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
    });
}
