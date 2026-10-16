"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/api';
import NotificationBell from '../../../components/NotificationBell';
import {
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Eye,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  KeyRound,
  FileText,
  MapPin,
  Mail,
  Phone,
  Check,
  X
} from 'lucide-react';

interface DashboardStats {
  totalSocieties: number;
  approved: number;
  pending: number;
  verified: number;
  newLeads: number;
  underReview: number;
  totalAdmins: number;
  totalResidents: number;
  trend: { month: string; count: number }[];
  planDist: { plan: string; count: number }[];
}

interface Registration {
  id: string;
  societyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  towers: number;
  totalFlats: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gst?: string;
  pan?: string;
  message?: string;
  status: string;
  createdAt: string;
}

interface Society {
  id: string;
  name: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  pincode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  plan: string;
  status: string;
  code: string;
  towers?: number;
  totalFlats?: number;
  adminId?: number;
  registrationId?: number;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  societyId: string | number;
  status: 'active' | 'inactive';
  isActive: boolean;
  createdAt: string;
  society?: {
    id: string | number;
    name: string;
    code: string;
    status: string;
  } | null;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'societies' | 'admins'>('dashboard');

  // Search & Filter state
  const [societySearch, setSocietySearch] = useState('');
  const [societyPlanFilter, setSocietyPlanFilter] = useState('all');
  const [societyStatusFilter, setSocietyStatusFilter] = useState('all');

  const [registrationSearch, setRegistrationSearch] = useState('');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState('all');

  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');

  // Modals state
  const [showAddSocietyModal, setShowAddSocietyModal] = useState(false);
  const [editingSociety, setEditingSociety] = useState<Society | null>(null);

  const [showAdminModal, setShowAdminModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    societyId?: string;
    societyName?: string;
    adminData?: { name: string; email: string; phone: string };
  }>({ isOpen: false, mode: 'create' });

  const [showViewRegModal, setShowViewRegModal] = useState<Registration | null>(null);
  const [showRejectRegModal, setShowRejectRegModal] = useState<Registration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showApproveRegModal, setShowApproveRegModal] = useState<Registration | null>(null);
  const [approveForm, setApproveForm] = useState({
    plan: 'starter',
    adminPassword: '',
  });

  // Society Add/Edit form state
  const [societyFormData, setSocietyFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    plan: 'starter',
    towers: 1,
    totalFlats: 10,
    status: 'approved',
  });

  // Admin form state
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Feedback Toast / Alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsRes, regsRes, socsRes, adminsRes] = await Promise.all([
        apiClient.getSuperAdminStats(),
        apiClient.getRegistrations(),
        apiClient.getSocieties(),
        apiClient.getAdmins(),
      ]);

      if (statsRes.success) setStats(statsRes.data as DashboardStats);
      if (regsRes.success) setRegistrations(regsRes.data as Registration[]);
      if (socsRes.success) setSocieties(socsRes.data as Society[]);
      if (adminsRes.success) setAdmins(adminsRes.data as AdminUser[]);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      showToast(error?.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------------------------------
  // REGISTRATIONS HANDLERS
  // --------------------------------------------------------------------------
  const openApproveModal = (reg: Registration) => {
    setShowApproveRegModal(reg);
    setApproveForm({
      plan: 'starter',
      adminPassword: '',
    });
  };

  const handleConfirmApproveLead = async () => {
    if (!showApproveRegModal) return;
    try {
      setActionLoading(true);
      const payload: any = {
        plan: approveForm.plan,
      };
      if (approveForm.adminPassword && approveForm.adminPassword.trim() !== '') {
        payload.adminPassword = approveForm.adminPassword.trim();
      }

      const res = await apiClient.approveRegistration(showApproveRegModal.id, payload);
      if (res.success) {
        showToast(`Registration approved! Generated code: ${(res.data as any)?.code || 'N/A'}`);
        setShowApproveRegModal(null);
        await loadDashboardData();
      } else {
        showToast(res.message || 'Failed to approve registration', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error approving registration', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRegistrationStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient.updateRegistration(id, { status });
      if (response.success) {
        showToast(`Registration status set to ${status}`);
        await loadDashboardData();
      } else {
        showToast(response.message || 'Failed to update registration status', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error updating registration status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRejectLead = async () => {
    if (!showRejectRegModal) return;
    try {
      setActionLoading(true);
      const res = await apiClient.updateRegistration(showRejectRegModal.id, {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Registration criteria not met',
      });
      if (res.success) {
        showToast('Registration rejected.');
        setShowRejectRegModal(null);
        setRejectionReason('');
        await loadDashboardData();
      } else {
        showToast(res.message || 'Failed to reject lead', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error rejecting registration', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // SOCIETIES HANDLERS (CRUD)
  // --------------------------------------------------------------------------
  const openAddSocietyModal = () => {
    setSocietyFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      plan: 'starter',
      towers: 1,
      totalFlats: 10,
      status: 'approved',
    });
    setShowAddSocietyModal(true);
  };

  const openEditSocietyModal = (soc: Society) => {
    setEditingSociety(soc);
    setSocietyFormData({
      name: soc.name || '',
      address: soc.address || '',
      city: soc.city || '',
      state: soc.state || '',
      country: soc.country || 'India',
      pincode: soc.pincode || '',
      contactName: soc.contactName || '',
      contactEmail: soc.contactEmail || '',
      contactPhone: soc.contactPhone || '',
      plan: soc.plan || 'starter',
      towers: soc.towers || 1,
      totalFlats: soc.totalFlats || 0,
      status: soc.status || 'approved',
    });
  };

  const handleSaveSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!societyFormData.name.trim() || !societyFormData.city.trim()) {
      showToast('Society name and city are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      if (editingSociety) {
        // UPDATE
        const res = await apiClient.updateSociety(editingSociety.id, societyFormData);
        if (res.success) {
          showToast('Society updated successfully');
          setEditingSociety(null);
          await loadDashboardData();
        } else {
          showToast(res.message || 'Failed to update society', 'error');
        }
      } else {
        // CREATE
        const res = await apiClient.createSociety(societyFormData);
        if (res.success) {
          showToast(`Society created! Code: ${(res.data as any)?.code || 'Generated'}`);
          setShowAddSocietyModal(false);
          await loadDashboardData();
        } else {
          showToast(res.message || 'Failed to create society', 'error');
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save society', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSociety = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action removes the live society and resets its registration lead.`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await apiClient.deleteSociety(id);
      if (res.success) {
        showToast('Society deleted successfully');
        await loadDashboardData();
      } else {
        showToast(res.message || 'Failed to delete society', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error deleting society', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveSociety = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient.approveSociety(id, { approvedBy: user?.id });
      if (response.success) {
        showToast('Society approved successfully!');
        await loadDashboardData();
      } else {
        showToast(response.message || 'Failed to approve society', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error approving society', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendSociety = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await apiClient.suspendSociety(id);
      if (response.success) {
        showToast('Society suspended!');
        await loadDashboardData();
      } else {
        showToast(response.message || 'Failed to suspend society', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error suspending society', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // ADMIN USERS HANDLERS
  // --------------------------------------------------------------------------
  const openCreateAdminModal = (soc: Society) => {
    setShowAdminModal({
      isOpen: true,
      mode: 'create',
      societyId: soc.id,
      societyName: soc.name,
    });
    setAdminFormData({
      name: soc.contactName || '',
      email: soc.contactEmail || '',
      phone: soc.contactPhone || '',
      password: '',
    });
  };

  const openEditAdminModal = (admin: AdminUser) => {
    setShowAdminModal({
      isOpen: true,
      mode: 'edit',
      societyId: String(admin.societyId),
      societyName: admin.society?.name || 'Society Admin',
      adminData: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
      },
    });
    setAdminFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: '',
    });
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAdminModal.societyId) return;

    if (!adminFormData.name.trim() || !adminFormData.email.trim() || !adminFormData.phone.trim()) {
      showToast('Name, Email, and Phone are required', 'error');
      return;
    }

    if (showAdminModal.mode === 'create' && (!adminFormData.password || adminFormData.password.length < 8)) {
      showToast('Password must be at least 8 characters for a new admin', 'error');
      return;
    }

    try {
      setActionLoading(true);
      if (showAdminModal.mode === 'create') {
        const res = await apiClient.createSocietyAdmin(showAdminModal.societyId, adminFormData);
        if (res.success) {
          showToast('Society Admin created and assigned successfully!');
          setShowAdminModal({ isOpen: false, mode: 'create' });
          await loadDashboardData();
        } else {
          showToast(res.message || 'Failed to create society admin', 'error');
        }
      } else {
        const res = await apiClient.updateSocietyAdminUser(showAdminModal.societyId, adminFormData);
        if (res.success) {
          showToast('Society Admin details updated successfully!');
          setShowAdminModal({ isOpen: false, mode: 'create' });
          await loadDashboardData();
        } else {
          showToast(res.message || 'Failed to update society admin', 'error');
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save admin user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdminStatus = async (adminId: string) => {
    try {
      setActionLoading(true);
      const res = await apiClient.toggleAdmin(adminId);
      if (res.success) {
        showToast(`Admin status changed to ${(res.data as any)?.status || 'updated'}`);
        await loadDashboardData();
      } else {
        showToast(res.message || 'Failed to toggle admin status', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Error updating admin status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // FILTERED DATA
  // --------------------------------------------------------------------------
  const filteredSocieties = societies.filter((soc) => {
    const matchesSearch =
      (soc.name || '').toLowerCase().includes(societySearch.toLowerCase()) ||
      (soc.code || '').toLowerCase().includes(societySearch.toLowerCase()) ||
      (soc.city || '').toLowerCase().includes(societySearch.toLowerCase()) ||
      (soc.contactEmail || '').toLowerCase().includes(societySearch.toLowerCase());

    const matchesPlan = societyPlanFilter === 'all' || soc.plan === societyPlanFilter;
    const matchesStatus = societyStatusFilter === 'all' || soc.status === societyStatusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      (reg.societyName || '').toLowerCase().includes(registrationSearch.toLowerCase()) ||
      (reg.contactName || '').toLowerCase().includes(registrationSearch.toLowerCase()) ||
      (reg.contactEmail || '').toLowerCase().includes(registrationSearch.toLowerCase()) ||
      (reg.city || '').toLowerCase().includes(registrationSearch.toLowerCase());

    const matchesStatus = registrationStatusFilter === 'all' || reg.status === registrationStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredAdmins = admins.filter((adm) => {
    const matchesSearch =
      (adm.name || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
      (adm.email || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
      (adm.phone || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
      (adm.society?.name || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
      (adm.society?.code || '').toLowerCase().includes(adminSearch.toLowerCase());

    const matchesStatus =
      adminStatusFilter === 'all' ||
      (adminStatusFilter === 'active' && adm.status === 'active') ||
      (adminStatusFilter === 'inactive' && adm.status === 'inactive');

    return matchesSearch && matchesStatus;
  });

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading Super Admin Portal...</p>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; subtitle?: string }> =
    ({ title, value, icon, color, subtitle }) => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3.5 rounded-xl ${color}`}>{icon}</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${feedback.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {feedback.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">MyGateBell</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-gray-500">Logged in as {user?.name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              title="Refresh Data"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <NotificationBell />
            <button
              onClick={logout}
              className="bg-white border border-gray-300 text-gray-700 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-rose-600 hover:border-rose-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'registrations'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            <FileText className="w-4 h-4" />
            Registrations / Leads
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
              {registrations.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('societies')}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'societies'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Societies
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
              {societies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'admins'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
          >
            <Users className="w-4 h-4" />
            Society Admins
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {admins.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Total Societies"
                value={stats.totalSocieties}
                icon={<Building2 className="w-6 h-6 text-white" />}
                color="bg-blue-600"
                subtitle="All active registered societies"
              />
              <StatCard
                title="New Leads"
                value={stats.newLeads}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-amber-500"
                subtitle="Awaiting review & onboarding"
              />
              <StatCard
                title="Society Admins"
                value={stats.totalAdmins}
                icon={<Shield className="w-6 h-6 text-white" />}
                color="bg-emerald-600"
                subtitle="Registered society admin accounts"
              />
              <StatCard
                title="Total Residents"
                value={stats.totalResidents}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-indigo-600"
                subtitle="Active residents across all societies"
              />
            </div>

            {/* Status Breakdown KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                title="Approved Societies"
                value={stats.approved}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-emerald-500"
              />
              <StatCard
                title="Under Review Leads"
                value={stats.underReview}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="bg-amber-500"
              />
              <StatCard
                title="Pending Verification"
                value={stats.pending}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-rose-500"
              />
            </div>

            {/* Signups Trend & Plan Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Monthly Society Signups</h3>
                  <span className="text-xs text-gray-400">Past 6 Months</span>
                </div>
                <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-gray-100">
                  {stats.trend.map((item, index) => {
                    const maxVal = Math.max(...stats.trend.map((t) => t.count), 1);
                    const pct = Math.round((item.count / maxVal) * 100);
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <span className="text-xs font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          {item.count}
                        </span>
                        <div
                          className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300"
                          style={{ height: `${Math.max(pct, 6)}%` }}
                        />
                        <span className="text-xs font-medium text-gray-500 mt-2">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Plan Distribution</h3>
                  <span className="text-xs text-gray-400">Subscription Tiers</span>
                </div>
                <div className="space-y-5 pt-3">
                  {stats.planDist.map((item, index) => {
                    const total = stats.totalSocieties || 1;
                    const pct = Math.round((item.count / total) * 100);
                    const colorMap: Record<string, string> = {
                      starter: 'bg-emerald-500',
                      professional: 'bg-blue-500',
                      enterprise: 'bg-purple-600',
                    };
                    const color = colorMap[item.plan.toLowerCase()] || 'bg-gray-500';

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-semibold text-gray-800">{item.plan}</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {item.count} societies ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REGISTRATIONS & LEADS */}
        {/* ========================================================================= */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Society Registrations & Onboarding Leads</h2>
                <p className="text-xs text-gray-500">
                  Audit, review, verify, approve into live societies, or reject applications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={registrationSearch}
                    onChange={(e) => setRegistrationSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-56"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={registrationStatusFilter}
                  onChange={(e) => setRegistrationStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Society & Scale</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Contact Person</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No registration leads found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{reg.societyName}</div>
                          <div className="text-xs text-gray-500">
                            {reg.towers || 1} Towers &bull; {reg.totalFlats || 0} Flats
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">
                            {reg.city}, {reg.state}
                          </div>
                          <div className="text-xs text-gray-400">{reg.pincode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{reg.contactName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {reg.contactEmail}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {reg.contactPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${reg.status === 'new'
                                ? 'bg-blue-100 text-blue-800'
                                : reg.status === 'under_review'
                                  ? 'bg-amber-100 text-amber-800'
                                  : reg.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            {reg.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Details */}
                            <button
                              onClick={() => setShowViewRegModal(reg)}
                              title="View Details"
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Status transitions */}
                            {reg.status === 'new' && (
                              <button
                                onClick={() => handleUpdateRegistrationStatus(reg.id, 'under_review')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-md transition"
                              >
                                Review
                              </button>
                            )}

                            {reg.status !== 'approved' && (
                              <button
                                onClick={() => openApproveModal(reg)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition shadow-sm"
                              >
                                Approve
                              </button>
                            )}

                            {reg.status !== 'rejected' && reg.status !== 'approved' && (
                              <button
                                onClick={() => {
                                  setShowRejectRegModal(reg);
                                  setRejectionReason('');
                                }}
                                disabled={actionLoading}
                                className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SOCIETIES (FULL CRUD) */}
        {/* ========================================================================= */}
        {activeTab === 'societies' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Societies</h2>
                <p className="text-xs text-gray-500">
                  Full CRUD: Create, read, update settings/plans, manage admins, and suspend/delete societies.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search societies..."
                    value={societySearch}
                    onChange={(e) => setSocietySearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-52"
                  />
                </div>

                {/* Plan filter */}
                <select
                  value={societyPlanFilter}
                  onChange={(e) => setSocietyPlanFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                {/* Status filter */}
                <select
                  value={societyStatusFilter}
                  onChange={(e) => setSocietyStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                </select>

                {/* Add Society Button */}
                <button
                  onClick={openAddSocietyModal}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Society
                </button>
              </div>
            </div>

            {/* Societies Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Society Info</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Contact Person</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSocieties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No societies found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSocieties.map((soc) => (
                      <tr key={soc.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{soc.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                              {soc.code || 'NO-CODE'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {soc.towers || 1} Towers &bull; {soc.totalFlats || 0} Flats
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">
                            {soc.city}, {soc.state || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">{soc.pincode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{soc.contactName || 'Unassigned'}</div>
                          <div className="text-xs text-gray-500">{soc.contactEmail}</div>
                          <div className="text-xs text-gray-500">{soc.contactPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${soc.plan === 'enterprise'
                                ? 'bg-purple-100 text-purple-800'
                                : soc.plan === 'professional'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {soc.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${soc.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : soc.status === 'verified'
                                  ? 'bg-blue-100 text-blue-800'
                                  : soc.status === 'suspended'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                          >
                            {soc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Create / Assign Admin */}
                            <button
                              onClick={() => openCreateAdminModal(soc)}
                              title="Assign or Create Admin Account"
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition flex items-center gap-1"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              Admin
                            </button>

                            {/* Edit Society */}
                            <button
                              onClick={() => openEditSocietyModal(soc)}
                              title="Edit Society"
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Suspend or Reactivate */}
                            {soc.status === 'approved' ? (
                              <button
                                onClick={() => handleSuspendSociety(soc.id)}
                                title="Suspend Society"
                                className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApproveSociety(soc.id)}
                                title="Approve/Reactivate Society"
                                className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                              >
                                Activate
                              </button>
                            )}

                            {/* Delete Society */}
                            <button
                              onClick={() => handleDeleteSociety(soc.id, soc.name)}
                              title="Delete Society"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SOCIETY ADMINS */}
        {/* ========================================================================= */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Society Admin Directory</h2>
                <p className="text-xs text-gray-500">
                  Inspect credentials, update contact details/passwords, and activate or deactivate admin access.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins or societies..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Admins Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Admin Profile</th>
                    <th className="px-6 py-3.5">Contact Details</th>
                    <th className="px-6 py-3.5">Associated Society</th>
                    <th className="px-6 py-3.5">Account Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No society administrators found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                              {adm.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{adm.name}</div>
                              <div className="text-xs text-gray-400">Role: {adm.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {adm.email}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {adm.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {adm.society ? (
                            <div>
                              <div className="font-medium text-gray-900">{adm.society.name}</div>
                              <span className="font-mono text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {adm.society.code}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unlinked (ID: {adm.societyId})</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${adm.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            {adm.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(adm.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Admin */}
                            <button
                              onClick={() => openEditAdminModal(adm)}
                              title="Edit Admin Credentials & Phone"
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleAdminStatus(adm.id)}
                              title={adm.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                              disabled={actionLoading}
                              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition flex items-center gap-1 ${adm.status === 'active'
                                  ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                }`}
                            >
                              {adm.status === 'active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Activate
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SOCIETY */}
      {/* ========================================================================= */}
      {(showAddSocietyModal || editingSociety) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {editingSociety ? `Edit Society: ${editingSociety.name}` : 'Add New Society'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddSocietyModal(false);
                  setEditingSociety(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSociety} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Society Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={societyFormData.name}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, name: e.target.value })}
                    placeholder="e.g. Greenwood Heights"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={societyFormData.address}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, address: e.target.value })}
                    placeholder="Street, Landmark, Area"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={societyFormData.city}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={societyFormData.state}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={societyFormData.pincode}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, pincode: e.target.value })}
                    placeholder="e.g. 411001"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subscription Plan</label>
                  <select
                    value={societyFormData.plan}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, plan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Towers</label>
                  <input
                    type="number"
                    min="1"
                    value={societyFormData.towers}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, towers: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Flats</label>
                  <input
                    type="number"
                    min="1"
                    value={societyFormData.totalFlats}
                    onChange={(e) =>
                      setSocietyFormData({ ...societyFormData, totalFlats: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={societyFormData.contactName}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, contactName: e.target.value })}
                    placeholder="Primary contact"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={societyFormData.contactPhone}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, contactPhone: e.target.value })}
                    placeholder="10 digit mobile"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={societyFormData.contactEmail}
                    onChange={(e) => setSocietyFormData({ ...societyFormData, contactEmail: e.target.value })}
                    placeholder="admin@society.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSocietyModal(false);
                    setEditingSociety(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  {actionLoading ? 'Saving...' : editingSociety ? 'Update Society' : 'Create Society'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT SOCIETY ADMIN */}
      {/* ========================================================================= */}
      {showAdminModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {showAdminModal.mode === 'create' ? 'Assign Admin User' : 'Edit Admin User'}
                  </h3>
                  <p className="text-xs text-gray-500">{showAdminModal.societyName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal({ isOpen: false, mode: 'create' })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admin Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  placeholder="admin@society.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminFormData.phone}
                  onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                  placeholder="10 digit mobile"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {showAdminModal.mode === 'create' ? (
                    <>
                      Password <span className="text-rose-500">*</span>
                    </>
                  ) : (
                    'New Password (leave blank to keep current)'
                  )}
                </label>
                <input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal({ isOpen: false, mode: 'create' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  {actionLoading
                    ? 'Saving...'
                    : showAdminModal.mode === 'create'
                      ? 'Create Admin'
                      : 'Update Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPROVE REGISTRATION WITH PLAN & CREDENTIALS */}
      {/* ========================================================================= */}
      {showApproveRegModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Approve & Activate Society</h3>
              </div>
              <button
                onClick={() => setShowApproveRegModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="font-bold text-gray-900">{showApproveRegModal.societyName}</div>
                <div className="text-xs text-gray-600">
                  {showApproveRegModal.city}, {showApproveRegModal.state} &bull; {showApproveRegModal.towers} Towers,{' '}
                  {showApproveRegModal.totalFlats} Flats
                </div>
                <div className="text-xs text-gray-600">
                  Admin: {showApproveRegModal.contactName} ({showApproveRegModal.contactEmail})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Tier Plan</label>
                <select
                  value={approveForm.plan}
                  onChange={(e) => setApproveForm({ ...approveForm, plan: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="starter">Starter Plan</option>
                  <option value="professional">Professional Plan</option>
                  <option value="enterprise">Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admin Password (Optional - defaults to auto-generated)
                </label>
                <input
                  type="password"
                  value={approveForm.adminPassword}
                  onChange={(e) => setApproveForm({ ...approveForm, adminPassword: e.target.value })}
                  placeholder="Leave empty for auto Admin@XXXX"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveRegModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproveLead}
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
                >
                  {actionLoading ? 'Approving...' : 'Confirm & Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW REGISTRATION LEAD DETAILS */}
      {/* ========================================================================= */}
      {showViewRegModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Registration Details</h3>
              </div>
              <button onClick={() => setShowViewRegModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Society Name</label>
                  <p className="font-bold text-gray-900 text-base">{showViewRegModal.societyName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Status</label>
                  <div>
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full capitalize bg-blue-100 text-blue-800">
                      {showViewRegModal.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Towers & Flats</label>
                  <p className="font-medium text-gray-800">
                    {showViewRegModal.towers} Towers, {showViewRegModal.totalFlats} Flats
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Location</label>
                  <p className="font-medium text-gray-800">
                    {showViewRegModal.city}, {showViewRegModal.state} - {showViewRegModal.pincode}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Address</label>
                  <p className="font-medium text-gray-800">{showViewRegModal.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Contact Person</label>
                  <p className="font-medium text-gray-800">{showViewRegModal.contactName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-semibold">Contact Phone</label>
                  <p className="font-medium text-gray-800">{showViewRegModal.contactPhone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 uppercase font-semibold">Contact Email</label>
                  <p className="font-medium text-gray-800">{showViewRegModal.contactEmail}</p>
                </div>
                {showViewRegModal.gst && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold">GST Number</label>
                    <p className="font-medium text-gray-800 font-mono">{showViewRegModal.gst}</p>
                  </div>
                )}
                {showViewRegModal.pan && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-semibold">PAN Number</label>
                    <p className="font-medium text-gray-800 font-mono">{showViewRegModal.pan}</p>
                  </div>
                )}
                {showViewRegModal.message && (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                    <label className="text-xs text-gray-400 uppercase font-semibold">Lead Message</label>
                    <p className="text-gray-700 italic mt-0.5">{showViewRegModal.message}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => setShowViewRegModal(null)}
                  className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT REGISTRATION LEAD */}
      {/* ========================================================================= */}
      {showRejectRegModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-gray-900">Reject Registration Lead</h3>
              </div>
              <button
                onClick={() => setShowRejectRegModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to reject the application for{' '}
                <strong className="text-gray-900">{showRejectRegModal.societyName}</strong>?
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete verification documents, duplicate submission..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectRegModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectLead}
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-sm"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
