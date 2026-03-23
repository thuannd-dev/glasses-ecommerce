import agent from "../api/agent";

export type GhnProvince = {
  ProvinceID: number;
  ProvinceName: string;
};

export type GhnDistrict = {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
};

export type GhnWard = {
  WardCode: string;
  WardName: string;
  DistrictID: number;
};

type ShippingProvinceDto = {
  provinceId: number;
  provinceName: string;
};

type ShippingDistrictDto = {
  districtId: number;
  districtName: string;
  provinceId: number;
};

type ShippingWardDto = {
  wardCode: string;
  wardName: string;
  districtId: number;
};

export async function fetchGhnProvinces(): Promise<GhnProvince[]> {
  const res = await agent.get<ShippingProvinceDto[]>("/shipping/provinces");
  const list = Array.isArray(res.data) ? res.data : [];
  return list.map((p) => ({
    ProvinceID: p.provinceId,
    ProvinceName: p.provinceName,
  }));
}

export async function fetchGhnDistricts(provinceId: number): Promise<GhnDistrict[]> {
  const res = await agent.get<ShippingDistrictDto[]>("/shipping/districts", {
    params: { provinceId },
  });
  const list = Array.isArray(res.data) ? res.data : [];
  return list.map((d) => ({
    DistrictID: d.districtId,
    DistrictName: d.districtName,
    ProvinceID: d.provinceId,
  }));
}

export async function fetchGhnWards(districtId: number): Promise<GhnWard[]> {
  const res = await agent.get<ShippingWardDto[]>("/shipping/wards", {
    params: { districtId },
  });
  const list = Array.isArray(res.data) ? res.data : [];
  return list.map((w) => ({
    WardCode: w.wardCode,
    WardName: w.wardName,
    DistrictID: w.districtId,
  }));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function findProvinceByName(
  provinces: GhnProvince[],
  provinceName: string
): GhnProvince | undefined {
  const key = normalizeText(provinceName);
  return provinces.find((p) => normalizeText(p.ProvinceName) === key);
}

export function findDistrictByName(
  districts: GhnDistrict[],
  districtName: string
): GhnDistrict | undefined {
  const key = normalizeText(districtName);
  return districts.find((d) => normalizeText(d.DistrictName) === key);
}

export function findWardByName(wards: GhnWard[], wardName: string): GhnWard | undefined {
  const key = normalizeText(wardName);
  return wards.find((w) => normalizeText(w.WardName) === key);
}

export async function fetchGhnShippingFee(params: {
  toDistrictId: number;
  toWardCode: string;
  serviceId?: number;
  serviceTypeId?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
}): Promise<number> {
  const response = await agent.get<number>("/shipping/fee", {
    params: {
      districtId: params.toDistrictId,
      wardCode: params.toWardCode,
      weight: params.weight ?? 200,
      insuranceValue: params.insuranceValue ?? 0,
    },
  });
  return Number(response.data ?? 0);
}

