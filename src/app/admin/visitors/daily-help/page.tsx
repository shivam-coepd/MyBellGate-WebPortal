"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  QrCode,
  Search,
  Plus,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Phone,
  Shield,
  ArrowLeft,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import apiClient from "../../../../services/api";
import { useAuth } from "../../../../contexts/AuthContext";

interface DailyHelper {
  id: number;
  flat_id: number;
  flat_number: string;
  building_name?: string;
  resident_name?: string;
  resident_phone?: string;
  name: string;
  phone: string;
  service_type: string;
  qr_code: string;
  image_url: string | null;
  vehicle_number: string | null;
  expected_time_in: string | null;
  expected_time_out: string | null;
  working_days: string;
  current_status?: "inside" | "exited" | null;
  last_entry_time?: string | null;
  last_exit_time?: string | null;
}

interface HelperLog {
  id: number;
  daily_helper_id: number;
  helper_name: string;
  helper_phone: string;
  service_type: string;
  helper_image?: string | null;
  flat_number: string;
  building_name?: string;
  resident_name?: string;
  entry_time: string;
  exit_time: string | null;
  guard_in_name?: string;
  guard_out_name?: string;
  status: "inside" | "exited";
  entry_method?: string;
  exit_method?: string;
}

interface Flat {
  id: number;
  flat_number: string;
  building_id?: number;
  building_name?: string;
}

export default function DailyHelpersManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"helpers" | "active" | "logs">("helpers");
  const [helpers, setHelpers] = useState<DailyHelper[]>([]);
  const [activeInside, setActiveInside] = useState<HelperLog[]>([]);
  const [logs, setLogs] = useState<HelperLog[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQrHelper, setSelectedQrHelper] = useState<DailyHelper | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    flat_id: "",
    name: "",
    phone: "",
    service_type: "Maid",
    vehicle_number: "",
    expected_time_in: "08:00",
    expected_time_out: "12:00",
    working_days: "All Days",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.society_id) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [helpersRes, activeRes, logsRes, flatsRes] = await Promise.all([
        apiClient.getDailyHelpers(),
        apiClient.getActiveInsideDailyHelpers(),
        apiClient.getDailyHelperLogs(),
        user?.society_id
          ? apiClient.getAllFlatsBySociety(user.society_id.toString())
          : Promise.resolve({ success: false, data: [] }),
      ]);

      if (helpersRes.success && helpersRes.data) {
        setHelpers(helpersRes.data as DailyHelper[]);
      }
      if (activeRes.success && activeRes.data) {
        setActiveInside(activeRes.data as HelperLog[]);
      }
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data as HelperLog[]);
      }
      if (flatsRes.success && flatsRes.data) {
        const flatList = Array.isArray(flatsRes.data)
          ? flatsRes.data
          : (flatsRes.data as any).data || [];
        setFlats(flatList);
      }
    } catch (err) {
      console.error("Error loading daily helpers data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHelper(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.flat_id || !formData.name || !formData.phone) {
      return alert("Please fill in Flat, Name, and Phone number");
    }

    setSubmitting(true);
    try {
      const res = await apiClient.createDailyHelper(formData);
      if (res.success) {
        alert("Daily Helper added and Static QR generated successfully!");
        setShowAddModal(false);
        setFormData({
          flat_id: "",
          name: "",
          phone: "",
          service_type: "Maid",
          vehicle_number: "",
          expected_time_in: "08:00",
          expected_time_out: "12:00",
          working_days: "All Days",
        });
        loadData();
      } else {
        alert(res.message || "Failed to create helper");
      }
    } catch (err: any) {
      alert(err?.message || "Error adding helper");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleManualExit(logId: number) {
    if (!confirm("Are you sure you want to mark exit for this worker?")) return;
    try {
      const res = await apiClient.manualExitDailyHelper(logId);
      if (res.success) {
        alert("Exit marked successfully!");
        loadData();
      } else {
        alert(res.message || "Failed to mark exit");
      }
    } catch (err: any) {
      alert(err?.message || "Error marking exit");
    }
  }

  async function handleDeleteHelper(id: number) {
    if (!confirm("Are you sure you want to delete this daily helper?")) return;
    try {
      const res = await apiClient.deleteDailyHelper(id);
      if (res.success) {
        alert("Helper deleted");
        loadData();
      }
    } catch (err: any) {
      alert(err?.message || "Error deleting helper");
    }
  }

  const filteredHelpers = helpers.filter((h) => {
    const matchesSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.phone.includes(search) ||
      h.flat_number?.toLowerCase().includes(search.toLowerCase()) ||
      h.qr_code.toLowerCase().includes(search.toLowerCase());
    const matchesService =
      selectedService === "all" || h.service_type === selectedService;
    return matchesSearch && matchesService;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Daily Help & Static QR Gate Pass
              </h1>
              <p className="text-sm text-gray-500">
                Static QR pass management, real-time entry/exit tracking, and attendance logs for maids, cooks, cleaners & caretakers.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Daily Helper
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Registered Helpers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{helpers.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Currently Inside</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{activeInside.length}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Movement Logs</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{logs.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab("helpers")}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition ${
            activeTab === "helpers"
              ? "border-purple-600 text-purple-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Helpers ({helpers.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === "active"
              ? "border-purple-600 text-purple-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Currently Inside Premises
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-bold">
            {activeInside.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition ${
            activeTab === "logs"
              ? "border-purple-600 text-purple-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Movement History Logs ({logs.length})
        </button>
      </div>

      {/* TAB 1: HELPERS LIST */}
      {activeTab === "helpers" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search helper by name, phone, flat or QR code..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                className="px-3 py-2 border rounded-lg text-sm bg-white"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="Maid">Maid</option>
                <option value="Cook">Cook</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Driver">Driver</option>
                <option value="Caretaker">Caretaker</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading helpers...</div>
          ) : filteredHelpers.length === 0 ? (
            <div className="p-12 text-center">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No daily helpers found</p>
              <p className="text-sm text-gray-400 mt-1">
                Add helper with their flat to generate permanent static QR code.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <th className="p-4">Helper Info</th>
                    <th className="p-4">Assigned Flat</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Timing & Days</th>
                    <th className="p-4">Static QR Code</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHelpers.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center overflow-hidden">
                            {h.image_url ? (
                              <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />
                            ) : (
                              h.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{h.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {h.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800">
                          {h.building_name ? `${h.building_name} - ` : ""}Flat {h.flat_number}
                        </span>
                        {h.resident_name && (
                          <div className="text-xs text-gray-500">Res: {h.resident_name}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold">
                          {h.service_type}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-600">
                        <div>
                          {h.expected_time_in ? `${h.expected_time_in} to ${h.expected_time_out}` : "Anytime"}
                        </div>
                        <div className="text-gray-400 mt-0.5">{h.working_days}</div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedQrHelper(h)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-mono font-medium transition"
                        >
                          <QrCode className="w-3.5 h-3.5 text-purple-600" />
                          <span>{h.qr_code}</span>
                        </button>
                      </td>
                      <td className="p-4">
                        {h.current_status === "inside" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Inside
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Outside
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedQrHelper(h)}
                            title="View / Print QR"
                            className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHelper(h.id)}
                            title="Delete"
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* TAB 2: CURRENTLY INSIDE */}
      {activeTab === "active" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {activeInside.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No helpers currently inside the society</p>
              <p className="text-sm text-gray-400 mt-1">
                When guards scan helper QR codes at the gate, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <th className="p-4">Helper</th>
                    <th className="p-4">Visiting Flat</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Entry Time</th>
                    <th className="p-4">Checked-In By Guard</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeInside.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{log.helper_name}</div>
                        <div className="text-xs text-gray-500">{log.helper_phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800">
                          {log.building_name ? `${log.building_name} - ` : ""}Flat {log.flat_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold">
                          {log.service_type}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-700">
                        {new Date(log.entry_time).toLocaleString()}
                      </td>
                      <td className="p-4 text-xs text-gray-600">{log.guard_in_name || "Gate Guard"}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleManualExit(log.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          Manual Mark Exit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOVEMENT HISTORY LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No logs found yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b">
                    <th className="p-4">Helper Name</th>
                    <th className="p-4">Flat</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Entry Timestamp</th>
                    <th className="p-4">Exit Timestamp</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const entry = new Date(log.entry_time);
                    const exit = log.exit_time ? new Date(log.exit_time) : null;
                    let durationText = "In Progress";
                    if (exit) {
                      const diffMins = Math.round((exit.getTime() - entry.getTime()) / 60000);
                      const hrs = Math.floor(diffMins / 60);
                      const mins = diffMins % 60;
                      durationText = `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
                    }

                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold text-gray-900">{log.helper_name}</td>
                        <td className="p-4">
                          {log.building_name ? `${log.building_name} - ` : ""}Flat {log.flat_number}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {log.service_type}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-600">{entry.toLocaleString()}</td>
                        <td className="p-4 text-xs text-gray-600">
                          {exit ? exit.toLocaleString() : "—"}
                        </td>
                        <td className="p-4 text-xs font-medium text-gray-700">{durationText}</td>
                        <td className="p-4">
                          {log.status === "inside" ? (
                            <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Inside
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              Exited ({log.exit_method || "scan"})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD HELPER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Daily Helper & Generate QR</h2>
            <form onSubmit={handleAddHelper} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Flat *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  value={formData.flat_id}
                  onChange={(e) => setFormData({ ...formData, flat_id: e.target.value })}
                >
                  <option value="">-- Choose Flat --</option>
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.building_name ? `${f.building_name} - ` : ""}Flat {f.flat_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Helper Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Devi"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                >
                  <option value="Maid">Maid</option>
                  <option value="Cook">Cook</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Driver">Driver</option>
                  <option value="Caretaker">Caretaker</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected In</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.expected_time_in}
                    onChange={(e) => setFormData({ ...formData, expected_time_in: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Out</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={formData.expected_time_out}
                    onChange={(e) => setFormData({ ...formData, expected_time_out: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? "Generating QR Pass..." : "Create Helper & QR Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE CARD MODAL */}
      {selectedQrHelper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Static Gate Pass QR</h3>
              <button
                onClick={() => setSelectedQrHelper(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50 flex flex-col items-center">
              <div className="font-bold text-gray-900 text-lg">{selectedQrHelper.name}</div>
              <div className="text-sm font-semibold text-purple-700">{selectedQrHelper.service_type}</div>
              <div className="text-xs text-gray-500 mb-3">
                Flat {selectedQrHelper.flat_number} {selectedQrHelper.building_name ? `(${selectedQrHelper.building_name})` : ""}
              </div>

              {/* Render QR image via quickchart / googlechart or svg */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  selectedQrHelper.qr_code
                )}`}
                alt="Helper QR Code"
                className="w-48 h-48 rounded-lg bg-white p-2 shadow-sm"
              />

              <div className="mt-3 font-mono font-bold text-sm text-gray-800 tracking-wider">
                {selectedQrHelper.qr_code}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Give this permanent QR code to {selectedQrHelper.name}. Guards scan it for both Entry & Exit.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
              >
                Print / Save Pass
              </button>
              <button
                onClick={() => setSelectedQrHelper(null)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
