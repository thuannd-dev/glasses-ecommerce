type GhnResponse<T> = {
  code: number;
  message: string;
  data: T;
};

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

const GHN_API_URL =
  import.meta.env.VITE_GHN_API_URL ?? "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN ?? "";
const GHN_SHOP_ID = Number(import.meta.env.VITE_GHN_SHOP_ID ?? 0);
const GHN_FROM_DISTRICT_ID = Number(import.meta.env.VITE_GHN_FROM_DISTRICT_ID ?? 0);
const GHN_FROM_WARD_CODE = import.meta.env.VITE_GHN_FROM_WARD_CODE ?? "";

function ensureToken() {
  if (!GHN_TOKEN) {
    throw new Error("Missing VITE_GHN_TOKEN in .env");
  }
}

function ensureShippingFeeConfig() {
  if (!GHN_SHOP_ID || !GHN_FROM_DISTRICT_ID || !GHN_FROM_WARD_CODE) {
    throw new Error("Missing VITE_GHN_SHOP_ID / VITE_GHN_FROM_DISTRICT_ID / VITE_GHN_FROM_WARD_CODE");
  }
}

async function ghnRequest<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  ensureToken();

  const response = await fetch(`${GHN_API_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      token: GHN_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`GHN request failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GhnResponse<T>;
  if (json.code !== 200) {
    throw new Error(json.message || "GHN request failed");
  }

  return json.data;
}

export async function fetchGhnProvinces(): Promise<GhnProvince[]> {
  return ghnRequest<GhnProvince[]>("/master-data/province");
}

export async function fetchGhnDistricts(provinceId: number): Promise<GhnDistrict[]> {
  return ghnRequest<GhnDistrict[]>("/master-data/district", { province_id: provinceId });
}

export async function fetchGhnWards(districtId: number): Promise<GhnWard[]> {
  return ghnRequest<GhnWard[]>("/master-data/ward", { district_id: districtId });
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

type GhnService = {
  service_id: number;
  short_name: string;
  service_type_id: number;
};

type GhnFeeData = {
  total: number;
  service_fee: number;
};

export async function fetchGhnAvailableServices(toDistrictId: number): Promise<GhnService[]> {
  ensureShippingFeeConfig();
  return ghnRequest<GhnService[]>("/v2/shipping-order/available-services", {
    shop_id: GHN_SHOP_ID,
    from_district: GHN_FROM_DISTRICT_ID,
    to_district: toDistrictId,
  });
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
  ensureShippingFeeConfig();
  const data = await ghnRequest<GhnFeeData>("/v2/shipping-order/fee", {
    from_district_id: GHN_FROM_DISTRICT_ID,
    from_ward_code: GHN_FROM_WARD_CODE,
    to_district_id: params.toDistrictId,
    to_ward_code: params.toWardCode,
    service_id: params.serviceId,
    service_type_id: params.serviceTypeId ?? (params.serviceId ? undefined : 2),
    weight: params.weight ?? 300,
    length: params.length ?? 20,
    width: params.width ?? 15,
    height: params.height ?? 10,
    insurance_value: params.insuranceValue ?? 0,
  });
  return Number(data.total ?? 0);
}

