import type { PrescriptionDetailRow } from "../types/prescription";
import type { MyPrescriptionDto } from "../types/myPrescriptions";
import type { PrescriptionFormOcrSeed } from "./mapPrescriptionOcrToFormSeed";
import { isPositiveAdd } from "./rxAdd";

function emptyRow(eye: 1 | 2): PrescriptionDetailRow {
  return { eye, sph: null, cyl: null, axis: null, pd: null, add: null };
}

function parseDecimal(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function parseAxis(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return null;
  const a = Math.round(n);
  if (a < 0 || a > 180) return null;
  return a;
}

function formatPdToken(n: number): string {
  const halfMm = Math.round(n * 2) / 2;
  return Number.isInteger(halfMm) ? String(halfMm) : halfMm.toFixed(1);
}

function normalizeEye(raw: string | null | undefined): "right" | "left" | null {
  const s = (raw || "").trim().toLowerCase();
  if (s === "right" || s.includes("od")) return "right";
  if (s === "left" || s.includes("os")) return "left";
  return null;
}

/** Map GET /api/me/prescriptions/:id → seed giống OCR để SelectLensesDialog dùng chung. */
export function mapMyPrescriptionToFormSeed(dto: MyPrescriptionDto): PrescriptionFormOcrSeed {
  const details: PrescriptionDetailRow[] = [emptyRow(1), emptyRow(2)];

  for (const row of dto.details ?? []) {
    const side = normalizeEye(row.eye);
    if (side === "right") {
      details[0].sph = parseDecimal(row.sph);
      details[0].cyl = parseDecimal(row.cyl);
      details[0].axis = parseAxis(row.axis);
      details[0].add = parseDecimal(row.add);
    } else if (side === "left") {
      details[1].sph = parseDecimal(row.sph);
      details[1].cyl = parseDecimal(row.cyl);
      details[1].axis = parseAxis(row.axis);
      details[1].add = parseDecimal(row.add);
    }
  }

  for (const r of details) {
    if (r.add != null && !isPositiveAdd(r.add)) r.add = null;
  }
  if (details[0].add != null && details[1].add == null) details[1].add = details[0].add;
  if (details[1].add != null && details[0].add == null) details[0].add = details[1].add;

  const detailRows = dto.details ?? [];
  const rightRow = detailRows.find((d) => normalizeEye(d.eye) === "right");
  const leftRow = detailRows.find((d) => normalizeEye(d.eye) === "left");
  const pdR = rightRow?.pd != null ? formatPdToken(Number(rightRow.pd)) : "";
  const pdL = leftRow?.pd != null ? formatPdToken(Number(leftRow.pd)) : "";

  let pdSingle = "";
  let twoPdNumbers = false;
  let pdLeft = "";
  let pdRight = "";

  if (pdR && pdL) {
    if (pdR === pdL) {
      pdSingle = pdR;
    } else {
      twoPdNumbers = true;
      pdRight = pdR;
      pdLeft = pdL;
    }
  } else if (pdR) {
    pdSingle = pdR;
  } else if (pdL) {
    pdSingle = pdL;
  }

  return {
    details,
    pdSingle,
    twoPdNumbers,
    pdLeft,
    pdRight,
    imageUrl: dto.imageUrl?.trim() ?? "",
    publicId: "",
    ocrWarnings: [],
  };
}
