/** Reading add: null/0 → no add (single vision); only values > 0 imply bifocal/multifocal. */
export function isPositiveAdd(add: number | null | undefined): add is number {
    return add != null && add > 0;
}

export function hasAnyPositiveAdd(details: ReadonlyArray<{ add?: number | null }>): boolean {
    return details.some((d) => isPositiveAdd(d.add));
}
