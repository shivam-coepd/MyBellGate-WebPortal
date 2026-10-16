"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  Plus,
  RefreshCw,
  Building,
  User,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import apiClient from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import AdminPageShell from "../../../components/AdminPageShell";

export interface AmenityBooking {
  id: number | string;
  amenity_id: number | string;
  amenity_name: string;
  resident_id: number | string;
  resident_name?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "requested" | "confirmed" | "cancelled" | "completed" | "already_booked" | string;
  total_amount?: number | string;
  created_at: string;
}

export interface Amenity {
  id: number | string;
  name: string;
  description?: string;
  image_url?: string;
  capacity?: number;
  booking_fee?: number;
  cancellation_fee?: number;
  is_active?: number;
}

export default function AmenitiesManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"bookings" | "amenities">("bookings");
  const [bookings, setBookings] = useState<AmenityBooking[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & form state
  const [showCreateAmenityModal, setShowCreateAmenityModal] = useState<boolean>(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | number | null>(null);

  const [newAmenity, setNewAmenity] = useState({
    name: "",
    description: "",
    image_url: "",
    capacity: 10,
    booking_fee: 0,
    cancellation_fee: 0,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmittingAmenity, setIsSubmittingAmenity] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsRes, amenitiesRes] = await Promise.all([
        apiClient.getBookings({ limit: 100 }),
        apiClient.getAmenities({ limit: 100 }),
      ]);

      if (bookingsRes.success) {
        const raw: any = bookingsRes.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
            ? raw.data
            : raw?.bookings && Array.isArray(raw.bookings)
              ? raw.bookings
              : [];
        setBookings(list);
      } else {
        setError(bookingsRes.message || "Failed to load bookings");
      }

      if (amenitiesRes.success) {
        const raw: any = amenitiesRes.data;
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
            ? raw.data
            : raw?.amenities && Array.isArray(raw.amenities)
              ? raw.amenities
              : [];
        setAmenities(list);
      }
    } catch (err: any) {
      console.error("Error loading amenities data:", err);
      setError(err?.message || "Failed to load amenities and bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (
    bookingId: string | number,
    status: "confirmed" | "cancelled" | "completed"
  ) => {
    try {
      setUpdatingStatusId(bookingId);
      const res = await apiClient.updateBookingStatus(bookingId, status);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      } else {
        alert(res.message || "Failed to update booking status");
      }
    } catch (err: any) {
      alert(err?.message || "Error updating booking status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await apiClient.uploadFile(file, "amenities");
      if (res.success && res.data?.url) {
        setNewAmenity((prev) => ({ ...prev, image_url: res.data.url }));
      } else {
        alert(res.message || "Failed to upload image");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err?.message || "Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenity.name.trim()) return alert("Amenity name is required");

    try {
      setIsSubmittingAmenity(true);
      const res = await apiClient.createAmenity(newAmenity);
      if (res.success) {
        setShowCreateAmenityModal(false);
        setNewAmenity({
          name: "",
          description: "",
          image_url: "",
          capacity: 10,
          booking_fee: 0,
          cancellation_fee: 0,
        });
        loadData();
      } else {
        alert(res.message || "Failed to create amenity");
      }
    } catch (err: any) {
      alert(err?.message || "Error creating amenity");
    } finally {
      setIsSubmittingAmenity(false);
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      b.amenity_name?.toLowerCase().includes(q) ||
      b.resident_name?.toLowerCase().includes(q) ||
      String(b.id).includes(q);
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "requested":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const requestedCount = bookings.filter((b) => b.status === "requested").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <AdminPageShell
      icon={<Sparkles className="w-6 h-6 text-indigo-600" />}
      title="Amenities & Bookings"
      subtitle="Manage society amenities, reserve slots, and approve booking requests"
      actions={
        <>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateAmenityModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Amenity</span>
          </button>
        </>
      }
    >
      <div className="pb-12">
        {/* Tab Navigation */}
        <div className="flex space-x-6 mb-6 border-b border-gray-200 pb-3 bg-white p-4 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${activeTab === "bookings"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings ({bookings.length})</span>
            {requestedCount > 0 && (
              <span className="bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                {requestedCount} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("amenities")}
            className={`pb-2 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${activeTab === "amenities"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            <Building className="w-4 h-4" />
            <span>All Amenities ({amenities.length})</span>
          </button>
        </div>

        {/* Main Container */}
        <div className="w-full mx-auto pt-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{bookings.length}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{requestedCount}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmed Bookings
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{confirmedCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Amenities
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{amenities.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-800">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BOOKINGS VIEW */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by amenity or resident..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600">Status:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="all">All Bookings</option>
                    <option value="requested">Requested (Pending)</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
                  <p className="text-sm font-medium">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base font-semibold text-gray-700">No bookings found</p>
                  <p className="text-sm mt-1">There are no amenity reservations matching your filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/80 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Booking ID</th>
                        <th className="px-6 py-3.5">Amenity</th>
                        <th className="px-6 py-3.5">Resident</th>
                        <th className="px-6 py-3.5">Date & Time</th>
                        <th className="px-6 py-3.5">Fee</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition">
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900">
                            #{b.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{b.amenity_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800">
                                {b.resident_name || `Resident #${b.resident_id}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-gray-900 font-medium text-xs">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{b.booking_date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {b.start_time} - {b.end_time}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              {Number(b.total_amount) > 0 ? `₹${b.total_amount}` : "Free"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusBadge(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {b.status === "requested" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                    disabled={updatingStatusId === b.id}
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1 disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(b.id, "cancelled")}
                                    disabled={updatingStatusId === b.id}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1 disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {b.status === "confirmed" && (
                                <button
                                  onClick={() => handleUpdateStatus(b.id, "completed")}
                                  disabled={updatingStatusId === b.id}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition disabled:opacity-50"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AMENITIES VIEW */}
          {activeTab === "amenities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {amenities.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {a.image_url ? (
                      <div className="h-40 w-full overflow-hidden bg-gray-100 relative">
                        <img
                          src={a.image_url}
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-28 w-full bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-300">
                        <Building className="w-10 h-10" />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{a.name}</h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${a.is_active !== 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                        >
                          {a.is_active !== 0 ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {a.description || "No description provided."}
                      </p>

                      <div className="space-y-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span className="font-semibold text-gray-800">{a.capacity || 10} Persons</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booking Fee:</span>
                          <span className="font-semibold text-gray-800">
                            {Number(a.booking_fee) > 0 ? `₹${a.booking_fee}` : "Free"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cancellation Fee:</span>
                          <span className="font-semibold text-gray-800">
                            {Number(a.cancellation_fee) > 0 ? `₹${a.cancellation_fee}` : "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-indigo-600 font-semibold">Ready for Reservations</span>
                    <button
                      onClick={() => {
                        setStatusFilter("all");
                        setActiveTab("bookings");
                        setSearchQuery(a.name);
                      }}
                      className="text-gray-500 hover:text-indigo-600 font-medium"
                    >
                      View Bookings →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CREATE AMENITY MODAL */}
        {showCreateAmenityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setShowCreateAmenityModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Add New Amenity
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Create a clubhouse facility, tennis court, pool, or hall for residents.
              </p>

              <form onSubmit={handleCreateAmenity} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amenity Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swimming Pool, Badminton Court"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Guidelines, rules, or details"
                    value={newAmenity.description}
                    onChange={(e) =>
                      setNewAmenity({ ...newAmenity, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Amenity Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amenity Photo
                  </label>
                  {newAmenity.image_url ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-2 h-32 bg-gray-50 flex items-center justify-center">
                      <img
                        src={newAmenity.image_url}
                        alt="Amenity Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewAmenity({ ...newAmenity, image_url: "" })}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow-md"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className={`border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/30 transition ${isUploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      {isUploadingImage ? (
                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mb-1" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      )}
                      <span className="text-xs font-medium text-gray-700">
                        {isUploadingImage ? "Uploading photo..." : "Click to select and upload photo"}
                      </span>
                      <span className="text-[11px] text-gray-400">PNG, JPG, WEBP up to 10MB</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newAmenity.capacity}
                      onChange={(e) =>
                        setNewAmenity({ ...newAmenity, capacity: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newAmenity.booking_fee}
                      onChange={(e) =>
                        setNewAmenity({
                          ...newAmenity,
                          booking_fee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Cancel Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newAmenity.cancellation_fee}
                      onChange={(e) =>
                        setNewAmenity({
                          ...newAmenity,
                          cancellation_fee: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAmenityModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAmenity}
                    className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingAmenity ? "Saving..." : "Create Amenity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
