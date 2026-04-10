import type { PrescriptionDetailRow } from "../types/prescription";
import type { PrescriptionOcrResultDto } from "../types/prescriptionOcr";
import { isPositiveAdd } from "./rxAdd";

export type PrescriptionFormOcrSeed = {
    details: PrescriptionDetailRow[];
    pdSingle: string;
    twoPdNumbers: boolean;
    pdLeft: string;
    pdRight: string;
    imageUrl: string;
    publicId: string;
    ocrWarnings: string[];
};

const emptyRow = (eye: 1 | 2): PrescriptionDetailRow => ({
    eye,
    sph: null,
    cyl: null,
    axis: null,
    pd: null,
    add: null,
});

function parseNumField(field?: { isExtracted?: boolean; value?: string | null } | null): number | null {
    if (!field?.isExtracted || field.value == null || String(field.value).trim() === "") return null;
    const n = parseFloat(String(field.value).replace(",", ".").trim());
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 4) / 4;
}

function parseAxisField(field?: { isExtracted?: boolean; value?: string | null } | null): number | null {
    if (!field?.isExtracted || field.value == null || String(field.value).trim() === "") return null;
    const n = parseFloat(String(field.value).replace(",", ".").trim());
    if (!Number.isFinite(n)) return null;
    const a = Math.round(n);
    if (a < 0 || a > 180) return null;
    return a;
}

/** PD is often in 0.5 mm steps; keep half-mm precision (do not round to whole mm). */
function parsePdToken(raw: string): string {
    const n = parseFloat(raw.replace(",", ".").trim());
    if (!Number.isFinite(n)) return "";
    const halfMm = Math.round(n * 2) / 2;
    return Number.isInteger(halfMm) ? String(halfMm) : halfMm.toFixed(1);
}

/**
 * Maps OCR DTO to form state (OD = eye 1, OS = eye 2) + PD single vs dual.
 */
export function mapPrescriptionOcrToFormSeed(ocr: PrescriptionOcrResultDto): PrescriptionFormOcrSeed {
    const details: PrescriptionDetailRow[] = [emptyRow(1), emptyRow(2)];

    const od = ocr.rightEye;
    const os = ocr.leftEye;

    if (od) {
        details[0].sph = parseNumField(od.sph);
        details[0].cyl = parseNumField(od.cyl);
        details[0].axis = parseAxisField(od.axis);
        details[0].add = parseNumField(od.add);
    }
    if (os) {
        details[1].sph = parseNumField(os.sph);
        details[1].cyl = parseNumField(os.cyl);
        details[1].axis = parseAxisField(os.axis);
        details[1].add = parseNumField(os.add);
    }

    for (const r of details) {
        if (r.add != null && !isPositiveAdd(r.add)) r.add = null;
    }
    if (details[0].add != null && details[1].add == null) details[1].add = details[0].add;
    if (details[1].add != null && details[0].add == null) details[0].add = details[1].add;

    let pdSingle = "";
    let twoPdNumbers = false;
    let pdLeft = "";
    let pdRight = "";

    const globalPdRaw =
        ocr.pd?.isExtracted && ocr.pd.value != null && String(ocr.pd.value).trim() !== ""
            ? String(ocr.pd.value).trim()
            : "";

    if (globalPdRaw.includes("/")) {
        const parts = globalPdRaw.split("/").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            const a = parsePdToken(parts[0]);
            const b = parsePdToken(parts[1]);
            if (a !== "" && b !== "") {
                twoPdNumbers = true;
                pdRight = a;
                pdLeft = b;
            }
        }
    } else if (globalPdRaw) {
        pdSingle = parsePdToken(globalPdRaw);
    } else if (
        od?.pd?.isExtracted &&
        os?.pd?.isExtracted &&
        od.pd.value &&
        os.pd.value &&
        String(od.pd.value).trim() !== "" &&
        String(os.pd.value).trim() !== ""
    ) {
        const a = parsePdToken(String(od.pd.value));
        const b = parsePdToken(String(os.pd.value));
        if (a !== "" && b !== "") {
            twoPdNumbers = true;
            pdRight = a;
            pdLeft = b;
        }
    } else if (od?.pd?.isExtracted && od.pd.value && String(od.pd.value).trim() !== "") {
        const s = parsePdToken(String(od.pd.value));
        if (s !== "") pdSingle = s;
    }

    return {
        details,
        pdSingle,
        twoPdNumbers,
        pdLeft,
        pdRight,
        imageUrl: ocr.imageUrl,
        publicId: ocr.publicId,
        ocrWarnings: Array.isArray(ocr.warnings) ? ocr.warnings : [],
    };
}
