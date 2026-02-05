import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  Pagination,
} from "@mui/material";
import { Download, Add } from "@mui/icons-material";
import KpiCard from "./components/KpiCard";
import DataTable from "./components/DataTable";
import { mockKpiData, mockTableData } from "./mockData";
import type { DataRow } from "./types";

const ITEMS_PER_PAGE = 5;

export default function ManagerDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "pending" | "inactive">("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData: DataRow[] = useMemo(() => {
    return mockTableData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleView = (id: string) => {
    console.log("View:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete:", id);
  };

  const handleExport = () => {
    console.log("Export data");
  };

  const handleAddNew = () => {
    console.log("Add new");
  };

  return (
    <Box>
      {/* =================== HEADER =================== */}
      <Box sx={{ mb: 5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 900,
                color: "rgba(15,23,42,0.92)",
                letterSpacing: -0.5,
              }}
            >
              Manager Dashboard
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: "rgba(15,23,42,0.60)",
                mt: 0.5,
              }}
            >
              Welcome back! Here's your business overview.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<Download sx={{ fontSize: 18 }} />}
                onClick={handleExport}
                sx={{
                  textTransform: "none",
                  borderColor: "rgba(15,23,42,0.2)",
                  color: "rgba(15,23,42,0.75)",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "rgba(15,23,42,0.4)",
                    backgroundColor: "rgba(15,23,42,0.02)",
                  },
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<Add sx={{ fontSize: 18 }} />}
                onClick={handleAddNew}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 8px 24px rgba(25,118,210,0.2)",
                }}
              >
                Add New
              </Button>
            </Box>
          </Box>
        </Box>

        {/* =================== KPI CARDS =================== */}
        <Grid container spacing={2.5} sx={{ mb: 5 }}>
          {mockKpiData.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.label}>
              <KpiCard data={kpi} />
            </Grid>
          ))}
        </Grid>

        {/* =================== FILTER & TABLE SECTION =================== */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            p: { xs: 2.5, md: 3.5 },
          }}
        >
          {/* Filter Bar */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <TextField
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              variant="outlined"
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "rgba(15,23,42,0.02)",
                  fontSize: 13,
                },
              }}
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "rgba(15,23,42,0.02)",
                  fontSize: 13,
                },
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>

          {/* Data Table */}
          <DataTable
            data={paginatedData}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="small"
              />
            </Box>
          )}

          {/* Results Info */}
          <Typography
            sx={{
              fontSize: 12,
              color: "rgba(15,23,42,0.60)",
              mt: 2,
              textAlign: "center",
            }}
          >
            Showing {paginatedData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}{" "}
            results
          </Typography>
        </Card>
    </Box>
  );
}
