"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Trash2,
  Edit2,
  Send,
  X,
  User,
  Building,
  Tag,
  RefreshCw,
} from "lucide-react";
import apiClient from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import AdminPageShell from "../../../components/AdminPageShell";

export interface TicketComment {
  id: string | number;
  ticket_id: string | number;
  user_id: string | number;
  commenter_name?: string;
  comment: string;
  created_at?: string;
}

export interface Ticket {
  id: string | number;
  ticket_number?: string;
  title: string;
  description: string;
  category: string; // general | maintenance | security | billing | plumbing | electrical | other
  priority: string; // low | medium | high | urgent
  status: string; // open | in_progress | resolved | closed
  resident_id?: string | number;
  resident_name?: string;
  assigned_to?: string | number;
  assigned_to_name?: string;
  flat_number?: string;
  society_id?: string | number;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
  comments?: TicketComment[];
  commentCount?: number;
}

export default function HelpdeskAdmin() {
  const router = useRouter();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "maintenance",
    priority: "medium",
  });

  // Comments for Detail Modal
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError(null);

      const params: any = { limit: 100 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;

      const res = await apiClient.getTickets(params);
      if (res && res.success) {
        let list: Ticket[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          list = (res.data as any).data;
        } else if (res.data && Array.isArray((res.data as any).tickets)) {
          list = (res.data as any).tickets;
        }
        setTickets(list);
      } else {
        throw new Error(res?.message || "Failed to load helpdesk tickets");
      }
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "An error occurred while loading tickets");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please provide both a title and description");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.createTicket(formData);
      if (res && res.success) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          category: "maintenance",
          priority: "medium",
        });
        await fetchTickets();
      } else {
        throw new Error(res?.message || "Failed to create ticket");
      }
    } catch (err: any) {
      alert(err.message || "Error creating ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(ticketId: string | number, newStatus: string) {
    try {
      const res = await apiClient.updateTicketStatus(ticketId, newStatus);
      if (res && res.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        throw new Error(res?.message || "Failed to update ticket status");
      }
    } catch (err: any) {
      alert(err.message || "Error updating status");
    }
  }

  async function handleDeleteTicket(ticketId: string | number) {
    if (!window.confirm("Are you sure you want to delete this helpdesk ticket?")) {
      return;
    }

    try {
      const res = await apiClient.deleteTicket(ticketId);
      if (res && res.success) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setShowDetailModal(false);
          setSelectedTicket(null);
        }
      } else {
        throw new Error(res?.message || "Failed to delete ticket");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting ticket");
    }
  }

  async function handleOpenDetail(ticket: Ticket) {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
    setNewComment("");

    // Fetch full details if needed
    try {
      const res = await apiClient.getTicketById(ticket.id);
      if (res && res.success && res.data) {
        const fullTicket = (res.data as any).ticket || res.data;
        setSelectedTicket(fullTicket);
      }
    } catch (err) {
      console.warn("Could not fetch full ticket details, displaying current state:", err);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await apiClient.addTicketComment(selectedTicket.id, newComment.trim());
      if (res && res.success) {
        const added: TicketComment = {
          id: Date.now(),
          ticket_id: selectedTicket.id,
          user_id: user?.id || "admin",
          commenter_name: user?.name || "Admin",
          comment: newComment.trim(),
          created_at: new Date().toISOString(),
        };

        const updatedComments = [...(selectedTicket.comments || []), added];
        setSelectedTicket({ ...selectedTicket, comments: updatedComments });
        setNewComment("");
      } else {
        throw new Error(res?.message || "Failed to post comment");
      }
    } catch (err: any) {
      alert(err.message || "Error posting comment");
    } finally {
      setSubmittingComment(false);
    }
  }

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ticket_number && t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.resident_name && t.resident_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.flat_number && t.flat_number.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  const getPriorityBadge = (priority: string) => {
    const p = (priority || "").toLowerCase();
    switch (p) {
      case "urgent":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "high":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "medium":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "low":
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "open":
        return {
          bg: "bg-red-50 text-red-600 border-red-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: "Open",
        };
      case "in_progress":
        return {
          bg: "bg-amber-50 text-amber-600 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "In Progress",
        };
      case "resolved":
        return {
          bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: "Resolved",
        };
      case "closed":
        return {
          bg: "bg-gray-100 text-gray-600 border-gray-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: "Closed",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-600 border-gray-200",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: status,
        };
    }
  };

  return (
    <AdminPageShell
      icon={<LifeBuoy className="w-6 h-6 text-blue-600" />}
      title="Helpdesk & Service Requests"
      subtitle="Track resident tickets, complaints & maintenance issues"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      }
    >
      <div>
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Total Tickets
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <LifeBuoy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Open Issues
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{openCount}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                In Progress
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
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

        {/* Filters and Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs mb-6 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket #, title, resident, or flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
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
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent font-medium text-gray-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="security">Security</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={fetchTickets}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded font-semibold transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tickets Table / List */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3" />
              <p className="text-sm text-gray-500">Loading helpdesk tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <LifeBuoy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                No tickets found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mb-5">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tickets match your filter criteria. Try clearing some filters."
                  : "There are currently no tickets logged. Create one or wait for residents to submit requests."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create New Ticket
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Ticket</th>
                    <th className="px-6 py-4">Resident / Flat</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => {
                    const statusBadge = getStatusBadge(ticket.status);
                    return (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50/60 transition cursor-pointer"
                        onClick={() => handleOpenDetail(ticket)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 line-clamp-1">
                                  {ticket.title}
                                </span>
                                {ticket.ticket_number && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                                    #{ticket.ticket_number}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                                {ticket.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                              {ticket.resident_name
                                ? ticket.resident_name[0].toUpperCase()
                                : "R"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-xs">
                                {ticket.resident_name || "Resident"}
                              </p>
                              {ticket.flat_number && (
                                <p className="text-[11px] text-gray-500">
                                  Flat {ticket.flat_number}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="capitalize text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                            {ticket.category || "General"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${getPriorityBadge(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority || "Medium"}
                          </span>
                        </td>

                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <select
                              value={ticket.status || "open"}
                              onChange={(e) =>
                                handleUpdateStatus(ticket.id, e.target.value)
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer appearance-none pr-6 focus:outline-none ${statusBadge.bg}`}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {ticket.created_at
                            ? new Date(ticket.created_at).toLocaleDateString()
                            : "Recently"}
                        </td>

                        <td
                          className="px-6 py-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetail(ticket)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                              title="View & Reply"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Delete Ticket"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* CREATE TICKET MODAL */}
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">New Helpdesk Ticket</h3>
                <p className="text-xs text-gray-500">
                  Log a complaint or service request on behalf of a resident
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Ticket Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leakage in basement pipe"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="security">Security</option>
                    <option value="billing">Billing</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide comprehensive details about the issue..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAIL & COMMENTS MODAL */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                {selectedTicket.ticket_number && (
                  <span className="text-xs bg-blue-50 text-blue-700 font-mono font-semibold px-2 py-0.5 rounded">
                    #{selectedTicket.ticket_number}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${getPriorityBadge(
                    selectedTicket.priority
                  )}`}
                >
                  {selectedTicket.priority} Priority
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full capitalize">
                  {selectedTicket.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-2">
                {selectedTicket.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                {selectedTicket.resident_name && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{selectedTicket.resident_name}</span>
                  </div>
                )}
                {selectedTicket.flat_number && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Flat {selectedTicket.flat_number}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {selectedTicket.created_at
                      ? new Date(selectedTicket.created_at).toLocaleString()
                      : "Recently created"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable details and conversation */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Issue Description
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-xs font-semibold text-blue-900">
                  Current Status:
                </span>
                <div className="flex items-center gap-2">
                  {["open", "in_progress", "resolved", "closed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition capitalize ${
                        selectedTicket.status === st
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Activity & Comments ({(selectedTicket.comments || []).length})
                </h4>

                <div className="space-y-3 mb-4">
                  {(selectedTicket.comments || []).length === 0 ? (
                    <p className="text-xs text-gray-400 italic bg-gray-50/50 p-3 rounded-lg text-center">
                      No comments yet. Leave a note or update for the resident.
                    </p>
                  ) : (
                    selectedTicket.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white p-3.5 rounded-xl border border-gray-200 text-sm shadow-2xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-gray-900">
                            {comment.commenter_name || "Support Staff"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {comment.created_at
                              ? new Date(comment.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Just now"}
                          </span>
                        </div>
                        <p className="text-gray-700 text-xs whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an update or reply..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
              <button
                onClick={() => handleDeleteTicket(selectedTicket.id)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Ticket
              </button>
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
    </AdminPageShell>
  );
}
