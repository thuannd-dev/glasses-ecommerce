export interface DataRow {
  id: string;
  name: string;
  status: "active" | "pending" | "inactive";
  createdDate: string;
  email?: string;
  amount?: number;
}

export interface KpiData {
  label: string;
  value: number;
  change?: number;
  icon: string;
}
