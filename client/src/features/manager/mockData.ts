import type { DataRow, KpiData } from "./types";

export const mockKpiData: KpiData[] = [
  {
    label: "Total Users",
    value: 1248,
    change: 12,
    icon: "👥",
  },
  {
    label: "Total Orders",
    value: 3456,
    change: 8,
    icon: "📦",
  },
  {
    label: "Revenue",
    value: 145230,
    change: 15,
    icon: "💰",
  },
  {
    label: "Pending Requests",
    value: 42,
    change: -5,
    icon: "⏳",
  },
];

export const mockTableData: DataRow[] = [
  {
    id: "1",
    name: "John Doe",
    status: "active",
    createdDate: "2026-01-15",
    email: "john@example.com",
    amount: 1299,
  },
  {
    id: "2",
    name: "Jane Smith",
    status: "pending",
    createdDate: "2026-02-01",
    email: "jane@example.com",
    amount: 2499,
  },
  {
    id: "3",
    name: "Mike Johnson",
    status: "active",
    createdDate: "2026-01-20",
    email: "mike@example.com",
    amount: 899,
  },
  {
    id: "4",
    name: "Sarah Williams",
    status: "inactive",
    createdDate: "2025-12-10",
    email: "sarah@example.com",
    amount: 1599,
  },
  {
    id: "5",
    name: "Tom Brown",
    status: "pending",
    createdDate: "2026-02-03",
    email: "tom@example.com",
    amount: 3299,
  },
  {
    id: "6",
    name: "Emily Davis",
    status: "active",
    createdDate: "2026-01-28",
    email: "emily@example.com",
    amount: 1199,
  },
];
