/** One eye row in prescription (OD = 1 = Right, OS = 2 = Left) */
export type PrescriptionDetailRow = {
  eye: 1 | 2;
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  pd: number | null;
  add: number | null;
};

export type PrescriptionData = {
  details: PrescriptionDetailRow[];
};

export const EYE_LABELS: Record<1 | 2, string> = {
  1: "OD (Right Eye)",
  2: "OS (Left Eye)",
};
