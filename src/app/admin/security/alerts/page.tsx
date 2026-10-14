"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  RefreshCw,
  X,
  User,
  Shield,
  Eye,
  Radio,
  AlertOctagon,
  Flame,
} from "lucide-react";
import apiClient from "../../../../services/api";
import { useAuth } from "../../../../contexts/AuthContext";

export interface SecurityAlert {
  id: number | string;
  alert_type: "suspicious_activity" | "unauthorized_access" | "emergency" | "other" | string;
  description: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  location?: string | null;
  image_url?: string | null;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  reported_by?: number | string | null;
  reported_by_name?: string | null;
  resolved_by?: number | string | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  society_id?: number | string | null;
  created_at: string;
  updated_at?: string | null;
}

export default function AdminSecurityAlertsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    alert_type: "suspicious_activity",
    severity: "medium",
    location: "",
    description: "",
    image_url: "",
  });

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (severityFilter !== "all") params.severity = severityFilter;
      if (typeFilter !== "all") params.alert_type = typeFilter;

      const res = await apiClient.getAlerts(params);
      if (res && res.success) {
        let list: SecurityAlert[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (res.data && Array.isArray((res.data as any).alerts)) {
          list = (res.data as any).alerts;
        }
        setAlerts(list);
      } else {
        throw new Error(res?.message || "Failed to load security alerts");
      }
    } catch (err: any) {
      console.error("Error fetching security alerts:", err);
      setError(err.message || "Failed to load security alerts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter, typeFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert("Please provide a description of the incident.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.reportAlert(formData);
      if (res && res.success) {
        setShowCreateModal(false);
        setFormData({
          alert_type: "suspicious_activity",
          severity: "medium",
          location: "",
          description: "",
          image_url: "",
        });
        await fetchAlerts();
      } else {
        throw new Error(res?.message || "Failed to broadcast security alert");
      }
    } catch (err: any) {
      alert(err.message || "Error submitting alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (alertId: string | number, newStatus: string) => {
    try {
      setUpdatingStatusId(alertId);
      const res = await apiClient.updateAlertStatus(String(alertId), newStatus);
      if (res && res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
        );
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        throw new Error(res?.message || "Failed to update alert status");
      }
    } catch (err: any) {
      alert(err.message || "Error updating alert status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Metrics
  const totalCount = alerts.length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length;
  const openCount = alerts.filter((a) => a.status === "open").length;
  const inProgressCount = alerts.filter((a) => a.status === "in_progress").length;
  const resolvedCount = alerts.filter(
    (a) => a.status === "resolved" || a.status === "closed"
  ).length;

  // Filtered
  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.description.toLowerCase().includes(q) ||
      a.alert_type.toLowerCase().includes(q) ||
      (a.location && a.location.toLowerCase().includes(q)) ||
      (a.reported_by_name && a.reported_by_name.toLowerCase().includes(q))
    );
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-red-100 text-red-800 border-red-300",
          icon: <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />,
          label: "CRITICAL",
        };
      case "high":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />,
          label: "HIGH",
        };
      case "medium":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          label: "MEDIUM",
        };
      case "low":
      default:
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: <Shield className="w-3.5 h-3.5 text-emerald-600" />,
          label: "LOW",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Open Incident",
        };
      case "in_progress":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Investigating",
        };
      case "resolved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Resolved",
        };
      case "closed":
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          label: "Closed",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          label: status,
        };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "suspicious_activity":
        return "Suspicious Activity";
      case "unauthorized_access":
        return "Unauthorized Access";
      case "emergency":
        return "Emergency / SOS";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="h-5 w-px bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">
                    Security Alerts & Incidents
                  </h1>
                  <p className="text-xs text-gray-500">
                    Real-time community security logs, SOS alerts & emergency monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title="Refresh Alerts"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Total Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Active / Open
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{openCount}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Critical / High
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Resolved
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs mb-6 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search description, location, or reported by..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="emergency">Emergency / SOS</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={fetchAlerts}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Alerts Grid / Table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-3" />
              <p className="text-sm text-gray-500">Loading security incidents...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No security alerts found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-5">
                {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                  ? "No alerts match the chosen filters. Try clearing filter options."
                  : "All clear! There are currently no security incidents reported."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
              >
                <Plus className="w-4 h-4" />
                Report Incident
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Severity & Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Reported By</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAlerts.map((alert) => {
                    const sev = getSeverityBadge(alert.severity);
                    const sta = getStatusBadge(alert.status);
                    return (
                      <tr
                        key={alert.id}
                        className="hover:bg-gray-50/60 transition cursor-pointer"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border w-fit ${sev.bg}`}
                            >
                              {sev.icon}
                              {sev.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-800">
                              {getTypeLabel(alert.alert_type)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium text-xs line-clamp-2 max-w-sm">
                            {alert.description}
                          </p>
                          {alert.image_url && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1">
                              <ImageIcon className="w-3 h-3" /> Attachment included
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {alert.location ? (
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span>{alert.location}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Not specified
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">
                              {alert.reported_by_name
                                ? alert.reported_by_name[0].toUpperCase()
                                : "U"}
                            </div>
                            <span className="text-xs font-medium text-gray-900">
                              {alert.reported_by_name || "Resident / Guard"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={alert.status}
                            disabled={updatingStatusId === alert.id}
                            onChange={(e) =>
                              handleUpdateStatus(alert.id, e.target.value)
                            }
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer focus:outline-none ${sta.bg}`}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {alert.created_at
                            ? new Date(alert.created_at).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recently"}
                        </td>

                        <td
                          className="px-6 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            title="View Incident Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE ALERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Broadcast Security Alert
                </h3>
                <p className="text-xs text-gray-500">
                  Broadcast an emergency notification to guards, staff, and residents
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Alert Type *
                  </label>
                  <select
                    value={formData.alert_type}
                    onChange={(e) =>
                      setFormData({ ...formData, alert_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                  >
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="emergency">Emergency / SOS</option>
                    <option value="other">Other Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Severity Level *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tower B - Basement Parking / Gate 2"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Incident Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the security event, individual involved, or emergency detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? "Broadcasting..." : "Broadcast Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  getSeverityBadge(selectedAlert.severity).bg
                }`}
              >
                {getSeverityBadge(selectedAlert.severity).icon}
                {getSeverityBadge(selectedAlert.severity).label}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
                {getTypeLabel(selectedAlert.alert_type)}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Incident Details
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-800 border border-gray-100 mb-4 whitespace-pre-wrap leading-relaxed">
              {selectedAlert.description}
            </div>

            {selectedAlert.image_url && (
              <div className="mb-4">
                <img
                  src={selectedAlert.image_url}
                  alt="Incident evidence"
                  className="rounded-xl max-h-60 w-full object-cover border border-gray-200"
                />
              </div>
            )}

            <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3 mb-4">
              {selectedAlert.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Location:</span>
                  <span>{selectedAlert.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">Reported By:</span>
                <span>{selectedAlert.reported_by_name || "Community Member"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">Timestamp:</span>
                <span>
                  {selectedAlert.created_at
                    ? new Date(selectedAlert.created_at).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              {selectedAlert.resolved_by_name && (
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Resolved By:</span>
                  <span>{selectedAlert.resolved_by_name}</span>
                </div>
              )}
            </div>

            {/* Quick status change bar */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-red-900">
                Update Status:
              </span>
              <div className="flex items-center gap-2">
                {["open", "in_progress", "resolved", "closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedAlert.id, st)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition capitalize ${
                      selectedAlert.status === st
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
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
