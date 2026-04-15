"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Image from "next/image";
import {
  bggreen,
  bgred,
  borderColor,
  greenColor,
  tableHeaderBg,
  tableHeaderText,
} from "@/utils/Colors";
import { getJSON, postJSON, putJSON, deleteJSON } from "@/utils/http";
import Swal from "sweetalert2";

export default function CategoriesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getJSON("categories");
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error(e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openAdd = () => {
    setEditingId(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setNameInput(cat.name || "");
    setDialogOpen(true);
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setNameInput("");
  };

  const handleSave = async () => {
    const name = nameInput.trim();
    if (!name) {
      await Swal.fire({
        icon: "warning",
        title: "Name required",
        text: "Please enter a category name.",
        confirmButtonColor: greenColor,
      });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const res = await putJSON(`categories/${editingId}`, { name });
        if (res?.success) {
          await Swal.fire({
            icon: "success",
            title: "Updated",
            text: res.message || "Category updated.",
            timer: 1800,
            showConfirmButton: false,
          });
          resetDialog();
          await loadCategories();
        }
      } else {
        const res = await postJSON("categories", { name });
        if (res?.success) {
          await Swal.fire({
            icon: "success",
            title: "Added",
            text: res.message || "Category created.",
            timer: 1800,
            showConfirmButton: false,
          });
          resetDialog();
          await loadCategories();
        }
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not save category.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: `Remove "${cat.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await deleteJSON(`categories/${cat._id}`);
      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1600,
        showConfirmButton: false,
      });
      await loadCategories();
    } catch (err) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: err.message || "Failed to delete.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const filtered = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          Categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage course categories. Names must be unique.
        </Typography>
      </Box>

      <Card
        sx={{
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              placeholder="Search categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{ maxWidth: { sm: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "#94A3B8", fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openAdd}
              sx={{
                bgcolor: greenColor,
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: "#3da986", boxShadow: "none" },
              }}
            >
              Add category
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: "none" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                {searchQuery ? "No categories match your search." : "No categories yet. Add one above."}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: tableHeaderBg,
                      "& th": {
                        color: tableHeaderText,
                        fontWeight: 600,
                        borderBottom: "none",
                        py: 2,
                        fontSize: "0.875rem",
                      },
                    }}
                  >
                    <TableCell>Name</TableCell>
                    <TableCell align="right" sx={{ width: 140 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((cat) => (
                    <TableRow key={cat._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {cat.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Box
                            component="button"
                            type="button"
                            onClick={() => openEdit(cat)}
                            sx={{
                              bgcolor: bggreen,
                              py: "8px",
                              px: "12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              "&:hover": { bgcolor: "#D8F8EC" },
                            }}
                          >
                            <Image
                              src="/images/comp/greenedit.png"
                              alt="Edit"
                              width={20}
                              height={20}
                              style={{ width: 20, height: 20 }}
                            />
                          </Box>
                          <Box
                            component="button"
                            type="button"
                            onClick={() => handleDelete(cat)}
                            sx={{
                              bgcolor: bgred,
                              py: "8px",
                              px: "12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              "&:hover": { bgcolor: "#FFE4E8" },
                            }}
                          >
                            <Image
                              src="/images/comp/redbin.png"
                              alt="Delete"
                              width={20}
                              height={20}
                              style={{ width: 20, height: 20 }}
                            />
                          </Box>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && resetDialog()}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle fontWeight={700}>{editingId ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            placeholder="e.g. Programming"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            margin="normal"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => !saving && resetDialog()} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: greenColor,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#3da986" },
            }}
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
    </Box>
  );
}
