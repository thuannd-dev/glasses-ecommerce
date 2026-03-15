/**
 * Chuẩn hóa chuỗi cho search: không phân biệt hoa thường, bỏ dấu, bỏ ký tự đặc biệt (vd. "-", space).
 * Dùng để so sánh (dropdown) hoặc gửi lên API (collection page).
 * Backend nên so sánh với brand/name đã chuẩn hóa tương tự (vd. LOWER + bỏ "-", space) thì "ray ban" mới match "Ray-Ban".
 */
export function normalizeForSearch(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (accent)
    .replace(/[^a-z0-9]/g, ""); // chỉ giữ chữ và số → "Ray-Ban" / "ray ban" thành "rayban"
}

/**
 * Từ keyword trả về chuỗi gửi lên API: có space thì lấy từ đầu, không space và >= 3 ký tự thì 3 ký tự đầu, còn lại nguyên.
 * Để API trả superset rồi lọc client theo full keyword (vd. "ray ban" / "rayban" → gửi "ray").
 */
export function getSearchParamForApi(keyword: string): string | undefined {
  const trimmed = keyword.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(" ")) return trimmed.split(/\s+/)[0] || undefined;
  if (trimmed.length >= 3) return trimmed.slice(0, 3);
  return trimmed;
}
