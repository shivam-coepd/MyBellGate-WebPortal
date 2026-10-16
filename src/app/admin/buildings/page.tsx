"use client";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Home,
  X,
  AlertCircle,
  Check,
  Search,
  User,
  Phone,
  Mail
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";
import AdminPageShell from "../../../components/AdminPageShell";

interface Building {
  id: string;
  name: string;
  society_id: number;
  total_floors: number;
  description: string;
  created_at?: string;
}

interface Flat {
  id: string;
  flat_number: string;
  flat_type: "1RK" | "1BHK" | "2BHK" | "3BHK" | "4BHK" | "4BHK+";
  floor_number: string | null;
  area_sqft: number | null;
  building_id: string;
  owner_id: string | null;
  tenant_id: string | null;
  society_id: number;
  is_occupied: boolean | number;
  user_role?: string;
  occupancy_status?: string;
}

const BuildingManagement: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [flatsLoading, setFlatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters
  const [buildingSearch, setBuildingSearch] = useState("");
  const [flatSearch, setFlatSearch] = useState("");
  const [flatFilter, setFlatFilter] = useState<"all" | "occupied" | "vacant">("all");

  // Modals state
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingFormData, setBuildingFormData] = useState({
    name: "",
    total_floors: 1,
    description: "",
  });

  const [showAddFlatsModal, setShowAddFlatsModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [flatFormData, setFlatFormData] = useState({
    flat_number: "",
    flat_type: "2BHK",
    floor_number: "",
    area_sqft: "",
    occupancy_status: "empty",
    user_role: "owner",
  });

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (user?.society_id) {
      loadBuildings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBuilding) {
      loadFlats(selectedBuilding.id);
    } else {
      setFlats([]);
    }
  }, [selectedBuilding]);

  async function loadBuildings(keepSelectedId?: string) {
    try {
      setLoading(true);
      if (!user?.society_id) {
        setBuildings([]);
        return;
      }

      const response = await apiClient.getBuildingsBySociety(user.society_id.toString());
      if (response.success) {
        const dataArray: Building[] = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || [];
        setBuildings(dataArray);

        if (dataArray.length > 0) {
          if (keepSelectedId) {
            const found = dataArray.find((b) => b.id.toString() === keepSelectedId.toString());
            setSelectedBuilding(found || dataArray[0]);
          } else if (!selectedBuilding) {
            setSelectedBuilding(dataArray[0]);
          } else {
            const stillExists = dataArray.find((b) => b.id.toString() === selectedBuilding.id.toString());
            setSelectedBuilding(stillExists || dataArray[0]);
          }
        } else {
          setSelectedBuilding(null);
        }
      } else {
        throw new Error(response.message || "Failed to load buildings");
      }
    } catch (err: any) {
      console.error(err.message || "An error occurred while fetching buildings");
      showToast(err.message || "Error fetching buildings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadFlats(buildingId: string) {
    try {
      setFlatsLoading(true);
      const response = await apiClient.getFlatsByBuilding(buildingId);
      if (response.success) {
        const dataArray: Flat[] = Array.isArray(response.data)
          ? response.data
          : (response.data as any).flats || (response.data as any).data || [];
        setFlats(dataArray);
      } else {
        throw new Error(response.message || "Failed to load flats");
      }
    } catch (err: any) {
      console.error(err.message || "An error occurred while fetching flats");
      showToast(err.message || "Error fetching flats", "error");
    } finally {
      setFlatsLoading(false);
    }
  }

  // ─── Building CRUD ──────────────────────────────────────────────────────────

  const openCreateBuildingModal = () => {
    setBuildingFormData({
      name: "",
      total_floors: 1,
      description: "",
    });
    setEditingBuilding(null);
    setShowAddBuildingModal(true);
  };

  const openEditBuildingModal = (building: Building, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBuilding(building);
    setBuildingFormData({
      name: building.name,
      total_floors: building.total_floors || 1,
      description: building.description || "",
    });
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingFormData.name.trim()) {
      showToast("Building name is required", "error");
      return;
    }

    try {
      setActionLoading(true);
      if (editingBuilding) {
        // UPDATE
        const res = await apiClient.updateBuilding(editingBuilding.id, {
          name: buildingFormData.name.trim(),
          total_floors: Number(buildingFormData.total_floors) || 1,
          description: buildingFormData.description.trim(),
        });

        if (res.success) {
          showToast("Building updated successfully");
          setEditingBuilding(null);
          await loadBuildings(editingBuilding.id);
        } else {
          showToast(res.message || "Failed to update building", "error");
        }
      } else {
        // CREATE
        const res = await apiClient.createBuilding({
          name: buildingFormData.name.trim(),
          total_floors: Number(buildingFormData.total_floors) || 1,
          description: buildingFormData.description.trim(),
          society_id: user?.society_id,
        });

        if (res.success) {
          showToast("Building created successfully");
          setShowAddBuildingModal(false);
          await loadBuildings();
        } else {
          showToast(res.message || "Failed to create building", "error");
        }
      }
    } catch (error: any) {
      showToast(error.message || "Error saving building", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBuilding = async (building: Building, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (
      !confirm(
        `Are you sure you want to delete building "${building.name}"? Note: The building must not have any assigned flats.`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiClient.deleteBuilding(building.id);
      if (res.success) {
        showToast("Building deleted successfully");
        if (selectedBuilding?.id === building.id) {
          setSelectedBuilding(null);
        }
        await loadBuildings();
      } else {
        showToast(res.message || "Failed to delete building", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Error deleting building", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Flat CRUD ─────────────────────────────────────────────────────────────

  const handleCreateFlats = async (data: any) => {
    try {
      setActionLoading(true);
      const response = await apiClient.createSingleFlatWithOwner({
        building_id: selectedBuilding!.id,
        flat_number: data.flat_number,
        flat_type: data.flat_type,
        floor_number: data.floor_number || "",
        area_sqft: data.area_sqft ? parseFloat(data.area_sqft) : undefined,
        society_id: user?.society_id || 0,
        user_role: data.user_role || "owner",
        occupancy_status: data.occupancy_status || "residing",
        owner: {
          name: data.owner_name,
          email: data.owner_email || undefined,
          phone: data.owner_phone,
          password: data.owner_password,
          role: "resident",
          society_id: user?.society_id || 0,
          resident_type: "owner",
          bio: undefined,
          profession: undefined,
          hometown: undefined,
          cover_image_url: undefined,
          profile_image: undefined,
        },
      });

      if (response.success) {
        showToast("Flat and owner added successfully");
        setShowAddFlatsModal(false);
        if (selectedBuilding) {
          loadFlats(selectedBuilding.id);
        }
      } else {
        showToast(response.message || "Failed to create flat", "error");
      }
    } catch (error: any) {
      showToast("Error creating flat: " + (error?.message || error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditFlatModal = (flat: Flat) => {
    setEditingFlat(flat);
    setFlatFormData({
      flat_number: flat.flat_number || "",
      flat_type: flat.flat_type || "2BHK",
      floor_number: flat.floor_number || "",
      area_sqft: flat.area_sqft ? flat.area_sqft.toString() : "",
      occupancy_status: flat.occupancy_status || (flat.is_occupied ? "residing" : "empty"),
      user_role: flat.user_role || "owner",
    });
  };

  const handleUpdateFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlat) return;
    if (!flatFormData.flat_number.trim()) {
      showToast("Flat number is required", "error");
      return;
    }

    try {
      setActionLoading(true);
      const payload: any = {
        flat_number: flatFormData.flat_number.trim(),
        flat_type: flatFormData.flat_type,
        floor_number: flatFormData.floor_number.trim(),
        area_sqft: flatFormData.area_sqft ? parseFloat(flatFormData.area_sqft) : null,
        occupancy_status: flatFormData.occupancy_status,
        user_role: flatFormData.user_role,
      };

      const res = await apiClient.updateFlat(editingFlat.id, payload);
      if (res.success) {
        showToast("Flat updated successfully");
        setEditingFlat(null);
        if (selectedBuilding) {
          loadFlats(selectedBuilding.id);
        }
      } else {
        showToast(res.message || "Failed to update flat", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Error updating flat", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFlat = async (flat: Flat) => {
    if (!confirm(`Are you sure you want to delete Flat "${flat.flat_number}"? This will remove the flat and any associated resident records.`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiClient.deleteFlat(flat.id);
      if (res.success) {
        showToast("Flat deleted successfully");
        if (selectedBuilding) {
          loadFlats(selectedBuilding.id);
        }
      } else {
        showToast(res.message || "Failed to delete flat", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Error deleting flat", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Filtered Data ─────────────────────────────────────────────────────────

  const filteredBuildings = buildings.filter((b) =>
    (b.name || "").toLowerCase().includes(buildingSearch.toLowerCase()),
  );

  const filteredFlats = flats.filter((f) => {
    const matchesSearch =
      (f.flat_number || "").toLowerCase().includes(flatSearch.toLowerCase()) ||
      (f.flat_type || "").toLowerCase().includes(flatSearch.toLowerCase()) ||
      (f.floor_number || "").toLowerCase().includes(flatSearch.toLowerCase());

    const isOcc = f.is_occupied === true || f.is_occupied === 1;
    const matchesFilter =
      flatFilter === "all" ||
      (flatFilter === "occupied" && isOcc) ||
      (flatFilter === "vacant" && !isOcc);

    return matchesSearch && matchesFilter;
  });

  if (loading && buildings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6 w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full animate-pulse flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse"></div>
          <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse md:col-span-2"></div>
        </div>
      </div>
    );
  }

  // Show error if user doesn't have society_id
  if (!user?.society_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Society Linked</h2>
          <p className="text-gray-600 mb-6">
            Your account is not linked to any society. Please contact the administrator.
          </p>
          <button
            onClick={() => (window.location.href = "/admin/dashboard")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPageShell
      icon={<Building2 className="w-6 h-6 text-blue-600" />}
      title="Building & Flat Management"
      subtitle="Complete management of buildings, wings, floors, and resident flats"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateBuildingModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 text-sm font-semibold shadow-xs"
          >
            <Building2 className="w-4 h-4" />
            <span>Add Building</span>
          </button>
          {selectedBuilding && (
            <button
              onClick={() => setShowAddFlatsModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2 text-sm font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flat</span>
            </button>
          )}
        </div>
      }
    >
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            feedback.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Buildings Column ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Buildings / Towers</span>
                  </h2>
                  <p className="text-xs text-gray-500">{buildings.length} total registered</p>
                </div>
                <button
                  onClick={openCreateBuildingModal}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Add new building"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Search building */}
              <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={buildingSearch}
                    onChange={(e) => setBuildingSearch(e.target.value)}
                    placeholder="Search building..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Building List */}
              <div className="p-3 space-y-2 max-h-[620px] overflow-y-auto">
                {filteredBuildings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No buildings found matching criteria.
                  </div>
                ) : (
                  filteredBuildings.map((building) => {
                    const isSelected = selectedBuilding?.id === building.id;
                    return (
                      <div
                        key={building.id}
                        onClick={() => setSelectedBuilding(building)}
                        className={`p-3.5 rounded-xl cursor-pointer transition border relative group ${
                          isSelected
                            ? "bg-blue-50/60 border-blue-500 shadow-xs"
                            : "bg-white hover:bg-gray-50/80 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 text-sm truncate">
                                {building.name}
                              </h3>
                              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                {building.total_floors || 1} {building.total_floors === 1 ? "Floor" : "Floors"}
                              </span>
                            </div>
                            {building.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {building.description}
                              </p>
                            )}
                          </div>

                          {/* Building Action Buttons */}
                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => openEditBuildingModal(building, e)}
                              title="Edit Building"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100/50 rounded-md transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteBuilding(building, e)}
                              title="Delete Building"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Flats Column ── */}
          <div className="lg:col-span-2">
            {selectedBuilding ? (
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                {/* Flats Header */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span>Flats in {selectedBuilding.name}</span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      Total: {flats.length} flats registered in this building
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Flat */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={flatSearch}
                        onChange={(e) => setFlatSearch(e.target.value)}
                        placeholder="Search flat..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-44"
                      />
                    </div>

                    {/* Filter Occupied */}
                    <select
                      value={flatFilter}
                      onChange={(e: any) => setFlatFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">All</option>
                      <option value="occupied">Occupied</option>
                      <option value="vacant">Vacant</option>
                    </select>

                    <button
                      onClick={() => setShowAddFlatsModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Flat</span>
                    </button>
                  </div>
                </div>

                {/* Flats Grid */}
                <div className="p-4 max-h-[620px] overflow-y-auto">
                  {flatsLoading ? (
                    <div className="text-center py-12 text-gray-400">Loading flats...</div>
                  ) : filteredFlats.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Home className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No flats found in this building</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Flat" above to register a flat and assign an owner.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                      {filteredFlats.map((flat) => {
                        const isOcc = flat.is_occupied === true || flat.is_occupied === 1;
                        return (
                          <div
                            key={flat.id}
                            className={`p-3.5 rounded-xl border transition relative group flex flex-col justify-between ${
                              isOcc
                                ? "bg-emerald-50/30 border-emerald-200 hover:border-emerald-300"
                                : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-base text-gray-900">
                                      {flat.flat_number}
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                                      {flat.flat_type}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Floor: {flat.floor_number || "—"}
                                  </div>
                                </div>

                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                    isOcc
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {isOcc ? "Occupied" : "Vacant"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Area:</span>
                                  <span className="font-medium text-gray-800">
                                    {flat.area_sqft ? `${flat.area_sqft} sqft` : "—"}
                                  </span>
                                </div>
                                {flat.owner_id && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Owner ID:</span>
                                    <span className="font-mono font-medium text-gray-800">
                                      #{flat.owner_id}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Flat Action Buttons */}
                            <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditFlatModal(flat)}
                                title="Edit Flat Details"
                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteFlat(flat)}
                                title="Delete Flat"
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800 mb-1">Select a Building</h3>
                <p className="text-xs text-gray-500">
                  Select a building or wing from the list on the left to view and manage its flats.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL: CREATE / EDIT BUILDING ─── */}
      {(showAddBuildingModal || editingBuilding) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingBuilding ? `Edit Building: ${editingBuilding.name}` : "Add New Building"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddBuildingModal(false);
                  setEditingBuilding(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBuilding} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Building / Tower Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buildingFormData.name}
                  onChange={(e) => setBuildingFormData({ ...buildingFormData, name: e.target.value })}
                  placeholder="e.g. Tower A or Wing 1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Floors <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={buildingFormData.total_floors}
                  onChange={(e) =>
                    setBuildingFormData({
                      ...buildingFormData,
                      total_floors: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={buildingFormData.description}
                  onChange={(e) =>
                    setBuildingFormData({ ...buildingFormData, description: e.target.value })
                  }
                  placeholder="Optional building notes, e.g. North wing near main gate..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBuildingModal(false);
                    setEditingBuilding(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-xs"
                >
                  {actionLoading
                    ? "Saving..."
                    : editingBuilding
                    ? "Update Building"
                    : "Create Building"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT FLAT ─── */}
      {editingFlat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Flat: {editingFlat.flat_number}
                </h3>
              </div>
              <button
                onClick={() => setEditingFlat(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFlat} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Flat Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={flatFormData.flat_number}
                  onChange={(e) => setFlatFormData({ ...flatFormData, flat_number: e.target.value })}
                  placeholder="e.g. 101"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Flat Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={flatFormData.flat_type}
                    onChange={(e: any) => setFlatFormData({ ...flatFormData, flat_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="1RK">1 RK</option>
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="4BHK">4 BHK</option>
                    <option value="4BHK+">4 BHK+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Floor Number</label>
                  <input
                    type="text"
                    value={flatFormData.floor_number}
                    onChange={(e) => setFlatFormData({ ...flatFormData, floor_number: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area (sqft)</label>
                <input
                  type="number"
                  step="0.01"
                  value={flatFormData.area_sqft}
                  onChange={(e) => setFlatFormData({ ...flatFormData, area_sqft: e.target.value })}
                  placeholder="e.g. 750"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    User Role
                  </label>
                  <select
                    value={flatFormData.user_role}
                    onChange={(e: any) => setFlatFormData({ ...flatFormData, user_role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="owner">Owner</option>
                    <option value="renting_family">Renting – Family</option>
                    <option value="renting_flatmates">Renting – Flatmates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Occupancy Status
                  </label>
                  <select
                    value={flatFormData.occupancy_status}
                    onChange={(e: any) =>
                      setFlatFormData({ ...flatFormData, occupancy_status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="residing">Residing</option>
                    <option value="let_out">Let Out</option>
                    <option value="empty">Empty</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingFlat(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-xs"
                >
                  {actionLoading ? "Updating..." : "Update Flat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD FLAT TO BUILDING ─── */}
      {showAddFlatsModal && selectedBuilding && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Add Flat to {selectedBuilding.name}
              </h2>
              <button
                onClick={() => setShowAddFlatsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateFlats({
                  flat_number: formData.get("flat_number"),
                  flat_type: formData.get("flat_type"),
                  floor_number: formData.get("floor_number"),
                  area_sqft: formData.get("area_sqft"),
                  user_role: formData.get("user_role"),
                  occupancy_status: formData.get("occupancy_status"),
                  owner_name: formData.get("owner_name"),
                  owner_email: formData.get("owner_email"),
                  owner_phone: formData.get("owner_phone"),
                  owner_password: formData.get("owner_password"),
                });
              }}
              className="space-y-6"
            >
              {/* ── Flat Details ── */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Flat Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Flat Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="flat_number"
                      placeholder="e.g. 101"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Flat Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="flat_type"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      defaultValue="2BHK"
                      required
                    >
                      <option value="1RK">1 RK</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK</option>
                      <option value="4BHK+">4 BHK+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Floor Number
                    </label>
                    <input
                      type="text"
                      name="floor_number"
                      placeholder="e.g. 1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Area (sqft)
                    </label>
                    <input
                      type="number"
                      name="area_sqft"
                      placeholder="e.g. 735"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Occupancy Details ── */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Occupancy Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      User Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="user_role"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      defaultValue="owner"
                      required
                    >
                      <option value="owner">Owner</option>
                      <option value="renting_family">Renting – Family</option>
                      <option value="renting_flatmates">Renting – Flatmates</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Occupancy Status
                    </label>
                    <select
                      name="occupancy_status"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      defaultValue="residing"
                    >
                      <option value="residing">Residing</option>
                      <option value="let_out">Let Out</option>
                      <option value="empty">Empty</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Owner Details ── */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Flat Owner Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Owner Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      placeholder="Full name of the flat owner"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="owner_email"
                      placeholder="owner@example.com"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="owner_phone"
                      placeholder="10-digit phone number"
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="owner_password"
                      placeholder="Set owner login password"
                      minLength={6}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddFlatsModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-semibold shadow-xs"
                >
                  {actionLoading ? "Adding..." : "Add Flat & Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default BuildingManagement;
