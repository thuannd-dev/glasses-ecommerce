/** Response from POST /api/uploads/prescription/analyze-url (camelCase JSON). */

export type OcrConfidenceLevel = "High" | "Medium" | "Low";

export interface OcrFieldDto {
    value?: string | null;
    confidence: number;
    isExtracted: boolean;
}

export interface ExtractedPrescriptionValueDto {
    sph?: OcrFieldDto | null;
    cyl?: OcrFieldDto | null;
    axis?: OcrFieldDto | null;
    pd?: OcrFieldDto | null;
    add?: OcrFieldDto | null;
    overallConfidence: number;
}

export interface PrescriptionOcrResultDto {
    imageUrl: string;
    publicId: string;
    rawText: string;
    rightEye?: ExtractedPrescriptionValueDto | null;
    leftEye?: ExtractedPrescriptionValueDto | null;
    pd?: OcrFieldDto | null;
    confidenceLevel: OcrConfidenceLevel;
    overallConfidence: number;
    parsedSuccessfully: boolean;
    warnings: string[];
}
