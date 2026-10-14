"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  Target,
  ArrowLeft,
  Megaphone,
  BarChart2,
  Send,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Bell,
  Building,
  User,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";

interface Poll {
  id: number;
  question: string;
  poll_type: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
  created_by_name: string;
  totalVotes?: number;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  category?: string;
  created_by_name?: string;
  target_group_id?: number | null;
  target_group_name?: string | null;
  send_via: string;
  scheduled_at?: string | null;
  is_draft: boolean | number;
  created_at: string;
}

interface Group {
  id: number;
  name: string;
  description?: string;
  member_count?: number;
}

interface BuildingItem {
  id: string | number;
  name: string;
}

interface ResidentItem {
  id: string | number;
  name: string;
  phone?: string;
  flat_number?: string;
}

interface SentNotificationLog {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: number;
  recipient_name: string;
  recipient_phone: string;
  flat_number?: string;
}

const CommunicationsManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useRouter();

  // Active tab: 'announcements' | 'polls' | 'direct_alerts'
  const [activeTab, setActiveTab] = useState<"announcements" | "polls" | "direct_alerts">(
    "announcements"
  );

  // Polls State
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState<boolean>(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    ends_at: "",
    poll_type: "public",
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] =
    useState<boolean>(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] =
    useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All");

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    category: "General",
    target_group_id: "" as string | number,
    send_via: "app",
    scheduled_at: "",
    is_draft: 0,
  });

  // Direct Push Alert / Notification State
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [residents, setResidents] = useState<ResidentItem[]>([]);
  const [sentLogs, setSentLogs] = useState<SentNotificationLog[]>([]);
  const [loadingDirectAlerts, setLoadingDirectAlerts] = useState<boolean>(false);
  const [showSendAlertModal, setShowSendAlertModal] = useState(false);

  const [newDirectAlert, setNewDirectAlert] = useState({
    title: "",
    message: "",
    target_type: "resident" as "resident" | "building",
    user_id: "",
    building_id: "",
    type: "alert",
    is_urgent: false,
  });

  // Groups State (for targeting announcements)
  const [groups, setGroups] = useState<Group[]>([]);

  // Common UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchPolls();
    fetchGroups();
    fetchDirectAlertResources();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // ----------------- Announcements -----------------
  async function fetchAnnouncements() {
    try {
      setLoadingAnnouncements(true);
      setError(null);
      const response = await apiClient.getAnnouncements({ limit: 100 });
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || [];
        setAnnouncements(dataArray);
      } else {
        throw new Error(response.message || "Failed to load announcements");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching announcements");
    } finally {
      setLoadingAnnouncements(false);
    }
  }

  async function fetchGroups() {
    try {
      const response = await apiClient.getGroups({ limit: 100, is_active: 1 });
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || [];
        setGroups(dataArray);
      }
    } catch (err) {
      // Non-critical
    }
  }

  // ----------------- Direct Alerts & Target Push -----------------
  async function fetchDirectAlertResources() {
    try {
      setLoadingDirectAlerts(true);
      // Fetch buildings
      if (user?.society_id) {
        const bRes = await apiClient.getBuildingsBySociety(user.society_id.toString());
        if (bRes.success && bRes.data) {
          const bList = Array.isArray(bRes.data) ? bRes.data : (bRes.data as any).data || [];
          setBuildings(bList);
        }
      }

      // Fetch active residents
      const uRes = await apiClient.getUsers({ role: "resident", status: "active", limit: 200 });
      if (uRes.success && uRes.data) {
        const uList = Array.isArray(uRes.data) ? uRes.data : (uRes.data as any).data || [];
        setResidents(uList);
      }

      // Fetch sent notifications history
      const histRes = await apiClient.getSentNotificationsHistory({ limit: 50 });
      if (histRes.success && histRes.data) {
        const hList = Array.isArray(histRes.data) ? histRes.data : (histRes.data as any).data || [];
        setSentLogs(hList);
      }
    } catch (err: any) {
      console.error("Failed to load direct alert resources:", err);
    } finally {
      setLoadingDirectAlerts(false);
    }
  }

  const handleSendDirectAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectAlert.title.trim() || !newDirectAlert.message.trim()) {
      alert("Please enter both title and message.");
      return;
    }

    if (newDirectAlert.target_type === "resident" && !newDirectAlert.user_id) {
      alert("Please select a target resident.");
      return;
    }

    if (newDirectAlert.target_type === "building" && !newDirectAlert.building_id) {
      alert("Please select a target building / wing.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        title: newDirectAlert.title.trim(),
        message: newDirectAlert.message.trim(),
        target_type: newDirectAlert.target_type,
        type: newDirectAlert.type,
        is_urgent: newDirectAlert.is_urgent,
      };

      if (newDirectAlert.target_type === "resident") {
        payload.user_id = Number(newDirectAlert.user_id);
      } else {
        payload.building_id = Number(newDirectAlert.building_id);
      }

      const res = await apiClient.sendCustomNotification(payload);

      if (res.success) {
        setShowSendAlertModal(false);
        setNewDirectAlert({
          title: "",
          message: "",
          target_type: "resident",
          user_id: "",
          building_id: "",
          type: "alert",
          is_urgent: false,
        });
        const resData = res.data as any;
        showSuccess(
          `Notification sent successfully to ${resData?.target_details || "recipients"} (${resData?.success_count || 1} delivered)!`
        );
        fetchDirectAlertResources();
      } else {
        throw new Error(res.message || "Failed to send notification");
      }
    } catch (err: any) {
      alert(err.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert("Please enter title and content.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        title: newAnnouncement.title.trim(),
        content: newAnnouncement.content.trim(),
        category: newAnnouncement.category || "General",
        send_via: newAnnouncement.send_via || "app",
        is_draft: newAnnouncement.is_draft,
      };

      if (newAnnouncement.target_group_id) {
        payload.target_group_id = Number(newAnnouncement.target_group_id);
      }

      if (newAnnouncement.scheduled_at) {
        // Backend expects 'YYYY-MM-DD HH:MM:SS'
        const formattedDate = newAnnouncement.scheduled_at.replace("T", " ") + ":00";
        payload.scheduled_at = formattedDate;
      }

      const response = await apiClient.createAnnouncement(payload);

      if (response.success) {
        setShowAddAnnouncementModal(false);
        setNewAnnouncement({
          title: "",
          content: "",
          category: "General",
          target_group_id: "",
          send_via: "app",
          scheduled_at: "",
          is_draft: 0,
        });
        showSuccess("Announcement broadcasted successfully!");
        fetchAnnouncements();
      } else {
        throw new Error(response.message || "Failed to create announcement");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this announcement? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.deleteAnnouncement(id);
      if (response.success) {
        showSuccess("Announcement deleted successfully");
        fetchAnnouncements();
      } else {
        throw new Error(response.message || "Failed to delete announcement");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting announcement");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Polls -----------------
  async function fetchPolls() {
    try {
      setLoadingPolls(true);
      setError(null);
      const response = await apiClient.getPolls({ limit: 100 });
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || [];
        setPolls(dataArray);
      } else {
        throw new Error(response.message || "Failed to load polls");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching polls");
    } finally {
      setLoadingPolls(false);
    }
  }

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newPoll.question ||
      newPoll.options.filter((o) => o.trim()).length < 2 ||
      !newPoll.ends_at
    ) {
      alert("Please fill out question, ends_at, and at least 2 options.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createPoll({
        question: newPoll.question,
        options: newPoll.options.filter((o) => o.trim()),
        ends_at: newPoll.ends_at,
        poll_type: newPoll.poll_type,
      });

      if (response.success) {
        setShowAddPollModal(false);
        setNewPoll({
          question: "",
          options: ["", ""],
          ends_at: "",
          poll_type: "public",
        });
        showSuccess("Poll created successfully!");
        fetchPolls();
      } else {
        throw new Error(response.message || "Failed to create poll");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const addOptionField = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const handleUpdatePollStatus = async (pollId: number, isActive: boolean) => {
    if (
      !window.confirm(
        "Are you sure you want to change the status of this poll?"
      )
    )
      return;
    try {
      setLoading(true);
      const response = await apiClient.updatePoll(pollId, {
        is_active: isActive,
      });
      if (response.success) {
        showSuccess("Poll status updated!");
        fetchPolls();
      } else {
        throw new Error(response.message || "Failed to update poll");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while updating the poll");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this poll? This action cannot be undone."
      )
    )
      return;
    try {
      setLoading(true);
      const response = await apiClient.deletePoll(pollId);
      if (response.success) {
        showSuccess("Poll deleted successfully");
        fetchPolls();
      } else {
        throw new Error(response.message || "Failed to delete poll");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate.push("/admin/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>Communications & Announcements</span>
              </h1>
              <p className="text-sm text-gray-500">{user?.society_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${activeTab === "announcements"
              ? "border-blue-600 text-blue-600 bg-blue-50/40"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Megaphone className="w-4 h-4" />
            Announcements & Notices
            <span
              className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${activeTab === "announcements"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              {announcements.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("polls")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${activeTab === "polls"
              ? "border-blue-600 text-blue-600 bg-blue-50/40"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <BarChart2 className="w-4 h-4" />
            Society Polls
            <span
              className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${activeTab === "polls"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              {polls.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("direct_alerts")}
            className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 ${activeTab === "direct_alerts"
              ? "border-amber-600 text-amber-600 bg-amber-50/40"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Radio className="w-4 h-4" />
            Direct Resident / Wing Push Alerts
            <span
              className={`ml-1.5 px-2 py-0.5 text-xs rounded-full ${activeTab === "direct_alerts"
                ? "bg-amber-600 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              {sentLogs.length}
            </span>
          </button>
        </div>

        {/* Global Notifications / Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: ANNOUNCEMENTS */}
        {/* ======================================================== */}
        {activeTab === "announcements" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Society Announcements
                </h2>
                <p className="text-sm text-gray-500">
                  Broadcast notices, alerts, and critical updates to residents
                  and groups
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAnnouncements}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-sm"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddAnnouncementModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-1.5 font-medium text-sm"
                >
                  <Plus size={18} /> New Announcement
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {["All", "General", "Important", "Event", "Amenity", "Maintenance"].map(
                (cat) => {
                  const isSel = selectedCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${isSel
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                }
              )}
            </div>

            {loadingAnnouncements ? (
              <div className="flex justify-center p-16 bg-white rounded-lg shadow">
                <div className="text-gray-500 font-medium">
                  Loading announcements...
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-lg shadow border border-dashed border-gray-300">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  No Announcements Published Yet
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
                  Publish notices regarding water supply, maintenance,
                  celebrations, or safety alerts to all residents.
                </p>
                <button
                  onClick={() => setShowAddAnnouncementModal(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-medium text-sm inline-flex items-center gap-1.5"
                >
                  <Plus size={18} /> Create First Announcement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements
                  .filter((ann) => {
                    if (selectedCategoryFilter === "All") return true;
                    return (
                      (ann.category || "General").toLowerCase() ===
                      selectedCategoryFilter.toLowerCase()
                    );
                  })
                  .map((ann) => {
                    const isDraft = ann.is_draft == 1 || ann.is_draft === true;
                    const category = ann.category || "General";
                    const categoryColors: Record<string, string> = {
                      Important: "bg-red-100 text-red-800 border-red-200",
                      Event: "bg-purple-100 text-purple-800 border-purple-200",
                      Amenity: "bg-emerald-100 text-emerald-800 border-emerald-200",
                      Maintenance: "bg-orange-100 text-orange-800 border-orange-200",
                      General: "bg-blue-100 text-blue-800 border-blue-200",
                    };
                    const badgeClass =
                      categoryColors[category] || "bg-gray-100 text-gray-800 border-gray-200";

                    return (
                      <div
                        key={ann.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
                      >
                        <div className="p-5 flex-grow">
                          <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${badgeClass}`}
                              >
                                {category}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${isDraft
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                                  }`}
                              >
                                {isDraft ? "Draft" : "Published"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                              <Target size={12} />
                              {ann.target_group_name || "All Residents"}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {ann.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-line">
                            {ann.content}
                          </p>

                          <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Users size={13} className="text-gray-400" />
                              <span>
                                By:{" "}
                                <strong className="text-gray-700">
                                  {ann.created_by_name || "Admin"}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-gray-400" />
                              <span>
                                {ann.created_at
                                  ? new Date(ann.created_at).toLocaleString()
                                  : "Just now"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                          <button
                            onClick={() => setSelectedAnnouncement(ann)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                            title="Delete announcement"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: POLLS */}
        {/* ======================================================== */}
        {activeTab === "polls" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Society Polls & Surveys
                </h2>
                <p className="text-sm text-gray-500">
                  Conduct community voting and collect feedback on society
                  decisions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchPolls}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-sm"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowAddPollModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-1.5 font-medium text-sm"
                >
                  <Plus size={18} /> Create Poll
                </button>
              </div>
            </div>

            {loadingPolls ? (
              <div className="flex justify-center p-16 bg-white rounded-lg shadow">
                <div className="text-gray-500 font-medium">
                  Loading polls...
                </div>
              </div>
            ) : polls.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-lg shadow border border-dashed border-gray-300">
                <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  No Polls Active
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
                  Launch a quick poll to vote on community initiatives, timing
                  changes, or new amenities.
                </p>
                <button
                  onClick={() => setShowAddPollModal(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition font-medium text-sm inline-flex items-center gap-1.5"
                >
                  <Plus size={18} /> Create New Poll
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll) => (
                  <div
                    key={poll.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition"
                  >
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${poll.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {poll.is_active ? "Active" : "Closed"}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-0.5 rounded">
                          <Target size={12} className="mr-1" /> {poll.poll_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {poll.question}
                      </h3>
                      <div className="text-xs text-gray-500 space-y-1 mt-4">
                        <p className="flex items-center">
                          <Users size={12} className="mr-1" /> Created by:{" "}
                          <strong className="ml-1 text-gray-700">
                            {poll.created_by_name || "Admin"}
                          </strong>
                        </p>
                        <p className="flex items-center">
                          <Calendar size={12} className="mr-1" /> Ends:{" "}
                          <strong className="ml-1 text-gray-700">
                            {poll.ends_at
                              ? new Date(poll.ends_at).toLocaleDateString()
                              : "No end date"}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 border-t flex justify-between items-center text-sm">
                      <button
                        onClick={() =>
                          handleUpdatePollStatus(poll.id, !poll.is_active)
                        }
                        className={`font-semibold text-xs ${poll.is_active
                          ? "text-amber-600 hover:text-amber-800"
                          : "text-green-600 hover:text-green-800"
                          }`}
                      >
                        {poll.is_active ? "Close Poll" : "Re-open Poll"}
                      </button>
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DIRECT RESIDENT / WING PUSH ALERTS */}
        {/* ======================================================== */}
        {activeTab === "direct_alerts" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Radio className="text-amber-600 w-5 h-5 animate-pulse" />
                  Targeted Resident & Wing Push Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  Instantly push urgent alerts or specific notices directly to a single resident or all residents of a selected building / wing.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchDirectAlertResources}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium text-sm"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowSendAlertModal(true)}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow hover:bg-amber-700 transition flex items-center gap-1.5 font-medium text-sm"
                >
                  <Send size={16} /> Send Direct Push Alert
                </button>
              </div>
            </div>

            {/* Quick Action Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Targeted Push Notification Delivery
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Messages are delivered directly to the resident&apos;s mobile app tray via FCM and logged in their in-app Notifications center.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm flex items-center gap-1.5">
                  <Building size={14} className="text-amber-600" /> {buildings.length} Wings/Buildings
                </span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm flex items-center gap-1.5">
                  <User size={14} className="text-amber-600" /> {residents.length} Active Residents
                </span>
              </div>
            </div>

            {/* Sent Notification History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" /> Sent Direct Alerts & Notifications History
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Showing last {sentLogs.length} transmissions
                </span>
              </div>

              {loadingDirectAlerts ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  Loading notification logs...
                </div>
              ) : sentLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium text-sm">No direct alerts sent yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Send your first targeted notification to a specific resident or building wing.
                  </p>
                  <button
                    onClick={() => setShowSendAlertModal(true)}
                    className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 transition inline-flex items-center gap-1.5"
                  >
                    <Send size={14} /> Send First Alert
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sentLogs.map((log) => {
                    const isAlert = log.type === "alert" || log.title.includes("🚨");
                    return (
                      <div
                        key={log.id}
                        className="p-5 hover:bg-gray-50/80 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 flex-grow">
                          <div
                            className={`p-2.5 rounded-full mt-0.5 ${
                              isAlert
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {isAlert ? <AlertTriangle size={18} /> : <Bell size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-gray-900 text-sm">{log.title}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isAlert
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {log.type}
                              </span>
                              {log.is_read ? (
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                                  Read
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                  Delivered
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                              {log.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <User size={12} className="text-gray-400" />
                                {log.recipient_name}
                                {log.flat_number && (
                                  <span className="text-gray-500 font-normal">
                                    ({log.flat_number})
                                  </span>
                                )}
                              </span>
                              {log.recipient_phone && (
                                <span className="text-gray-400">{log.recipient_phone}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-400 whitespace-nowrap self-end md:self-center">
                          <Calendar size={12} className="inline mr-1" />
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString()
                            : "Recently"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: SEND TARGETED DIRECT PUSH ALERT */}
      {/* ======================================================== */}
      {showSendAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-lg">Push Direct Alert / Notification</h3>
              </div>
              <button
                onClick={() => setShowSendAlertModal(false)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendDirectAlert} className="p-6">
              <div className="space-y-4">
                {/* Target Scope Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Target Recipient Scope <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          target_type: "resident",
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                        newDirectAlert.target_type === "resident"
                          ? "border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <User size={18} className="text-amber-600" />
                      <div>
                        <div className="text-xs font-bold">Specific Resident</div>
                        <div className="text-[10px] text-gray-500 font-normal">
                          Single user / resident
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          target_type: "building",
                        })
                      }
                      className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                        newDirectAlert.target_type === "building"
                          ? "border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Building size={18} className="text-amber-600" />
                      <div>
                        <div className="text-xs font-bold">Specific Wing / Building</div>
                        <div className="text-[10px] text-gray-500 font-normal">
                          All flats in selected wing
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Conditional selector: Resident vs Building */}
                {newDirectAlert.target_type === "resident" ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Select Resident User <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newDirectAlert.user_id}
                      onChange={(e) =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          user_id: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">-- Choose Resident --</option>
                      {residents.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.flat_number ? `(${r.flat_number})` : ""} - {r.phone || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Select Wing / Building <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={newDirectAlert.building_id}
                      onChange={(e) =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          building_id: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">-- Choose Building / Wing --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          Building/Wing: {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Notification Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newDirectAlert.title}
                      onChange={(e) =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          title: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      placeholder="e.g. Water Supply Interruption / Package at Gate"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Alert Type
                    </label>
                    <select
                      value={newDirectAlert.type}
                      onChange={(e) =>
                        setNewDirectAlert({
                          ...newDirectAlert,
                          type: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="alert">Security Alert</option>
                      <option value="notice">Notice</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Notification Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newDirectAlert.message}
                    onChange={(e) =>
                      setNewDirectAlert({
                        ...newDirectAlert,
                        message: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="Provide specific instructions or details for this resident or building wing..."
                  />
                </div>

                {/* Urgent Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_urgent"
                    checked={newDirectAlert.is_urgent}
                    onChange={(e) =>
                      setNewDirectAlert({
                        ...newDirectAlert,
                        is_urgent: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <label htmlFor="is_urgent" className="text-xs font-medium text-gray-700 cursor-pointer flex items-center gap-1">
                    <span className="text-red-600 font-bold">Mark as Urgent Alert</span> (Adds high-priority indicator 🚨 in push notification tray)
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSendAlertModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 font-medium text-sm flex items-center gap-1.5 disabled:opacity-50 shadow"
                >
                  <Send size={15} /> Send Push Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE ANNOUNCEMENT */}
      {/* ======================================================== */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                <h3 className="text-lg font-bold">New Society Announcement</h3>
              </div>
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Announcement Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="E.g., Scheduled Water Tank Cleaning on Sunday"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Content / Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Write your detailed announcement here..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAnnouncement.category}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          category: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Important">Important</option>
                      <option value="Event">Event</option>
                      <option value="Amenity">Amenity</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={newAnnouncement.target_group_id}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          target_group_id: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">All Residents (Society Wide)</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          Group: {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Notification Channel
                    </label>
                    <select
                      value={newAnnouncement.send_via}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          send_via: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="app">Mobile App/In-App</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={newAnnouncement.is_draft}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          is_draft: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={0}>Publish & Notify Immediately</option>
                      <option value={1}>Save as Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Schedule For (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newAnnouncement.scheduled_at}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          scheduled_at: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={15} /> Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW ANNOUNCEMENT DETAILS */}
      {/* ======================================================== */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-2.5 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${selectedAnnouncement.is_draft == 1 ||
                    selectedAnnouncement.is_draft === true
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                    }`}
                >
                  {selectedAnnouncement.is_draft == 1 ||
                    selectedAnnouncement.is_draft === true
                    ? "Draft"
                    : "Published"}
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {selectedAnnouncement.title}
              </h3>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                {selectedAnnouncement.content}
              </div>

              <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-gray-800">
                    {selectedAnnouncement.category || "General"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Target Audience:</span>
                  <strong className="text-gray-800">
                    {selectedAnnouncement.target_group_name || "All Residents"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <strong className="text-gray-800 uppercase">
                    {selectedAnnouncement.send_via}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Created By:</span>
                  <strong className="text-gray-800">
                    {selectedAnnouncement.created_by_name || "Admin"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Published On:</span>
                  <strong className="text-gray-800">
                    {selectedAnnouncement.created_at
                      ? new Date(selectedAnnouncement.created_at).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE POLL */}
      {/* ======================================================== */}
      {showAddPollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                <h3 className="text-lg font-bold">Create New Poll</h3>
              </div>
              <button
                onClick={() => setShowAddPollModal(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Poll Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPoll.question}
                    onChange={(e) =>
                      setNewPoll({ ...newPoll, question: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="E.g., What time should the clubhouse close?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Voting Options <span className="text-red-500">*</span>
                  </label>
                  {newPoll.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-blue-600 text-xs font-semibold hover:underline"
                  >
                    + Add Another Option
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newPoll.ends_at}
                    onChange={(e) =>
                      setNewPoll({ ...newPoll, ends_at: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Poll Visibility
                  </label>
                  <select
                    value={newPoll.poll_type}
                    onChange={(e) =>
                      setNewPoll({ ...newPoll, poll_type: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="public">Public (Votes are visible)</option>
                    <option value="secret">Secret Ballot (Anonymous)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPollModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsManagement;
