import type { CartItemDto } from "../../lib/types/cart";
import type { PrescriptionData } from "../../lib/types/prescription";

function hasAnyRxNumber(item: CartItemDto): boolean {
  const nums = [
    item.sphOD,
    item.cylOD,
    item.axisOD,
    item.addOD,
    item.pdOD,
    item.sphOS,
    item.cylOS,
    item.axisOS,
    item.addOS,
    item.pdOS,
    item.pd,
  ];
  return nums.some((n) => n != null);
}

export function prescriptionFromCartItem(item: CartItemDto): PrescriptionData | undefined {
  if (!item.hasPrescription || !hasAnyRxNumber(item)) return undefined;
  const fallbackPd = item.pd ?? null;
  return {
    details: [
      {
        eye: 1,
        sph: item.sphOD ?? null,
        cyl: item.cylOD ?? null,
        axis: item.axisOD ?? null,
        add: item.addOD ?? null,
        pd: item.pdOD ?? fallbackPd,
      },
      {
        eye: 2,
        sph: item.sphOS ?? null,
        cyl: item.cylOS ?? null,
        axis: item.axisOS ?? null,
        add: item.addOS ?? null,
        pd: item.pdOS ?? fallbackPd,
      },
    ],
  };
}

