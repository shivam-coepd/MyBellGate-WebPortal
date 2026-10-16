"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../services/api";
import AdminPageShell from "../../../components/AdminPageShell";
import {
  DollarSign,
  FileText,
  Plus,
  Receipt,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ChargeHead {
  id: string;
  name: string;
  description: string;
  charge_type: string;
  amount: number;
  gst_rate: number;
  is_active: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  flat_number: string;
  resident_name: string;
  total_amount: number;
  total_gst: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

interface Flat {
  id: string;
  flat_number: string;
  building_id?: string | number;
  building_name?: string;
  owner_name?: string;
}

interface Building {
  id: string | number;
  name: string;
  code?: string;
  total_floors?: number;
}

const AccountingManagement: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [chargeHeads, setChargeHeads] = useState<ChargeHead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "charge-heads" | "invoices"
  >("overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "invoices" || tab === "charge-heads" || tab === "overview") {
      setActiveTab(tab as any);
    }
  }, [searchParams]);
  const [showAddChargeHeadModal, setShowAddChargeHeadModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  // Create Invoice State
  const [invoiceForm, setInvoiceForm] = useState({
    target_type: "flat" as "flat" | "building",
    building_id: "",
    flat_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
  });
  const [invoiceItems, setInvoiceItems] = useState([
    { charge_head_id: "", unit_price: 0, quantity: 1 },
  ]);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [chargeHeadsRes, invoicesRes] = await Promise.all([
        apiClient.getChargeHeads({ is_active: 1 }),
        apiClient.getInvoices(),
      ]);

      if (chargeHeadsRes.success)
        setChargeHeads(chargeHeadsRes.data as ChargeHead[]);
      if (invoicesRes.success) setInvoices(invoicesRes.data as Invoice[]);

      // Fetch Flats and Buildings
      if (user?.society_id) {
        const [flatsRes, buildingsRes] = await Promise.all([
          apiClient.getAllFlatsBySociety(user.society_id.toString()),
          apiClient.getBuildingsBySociety(user.society_id.toString()),
        ]);

        if (flatsRes.success && flatsRes.data) {
          const flatList = Array.isArray(flatsRes.data) ? flatsRes.data : (flatsRes.data as any).data || [];
          setFlats(flatList as Flat[]);
        }

        if (buildingsRes.success && buildingsRes.data) {
          const bList = Array.isArray(buildingsRes.data) ? buildingsRes.data : (buildingsRes.data as any).data || [];
          setBuildings(bList as Building[]);
        }
      }
    } catch (error) {
      console.error("Error loading accounting data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && chargeHeads.length === 0 && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-6 w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 w-full animate-pulse flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 h-96 animate-pulse mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user?.society_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <DollarSign className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Society Linked
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is not linked to any society. Please contact the
            administrator to link your account to a society.
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

  const handleCreateChargeHead = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      charge_type: formData.get("charge_type"),
      amount: parseFloat(formData.get("amount") as string),
      gst_rate: parseFloat(formData.get("gst_rate") as string),
    };

    try {
      const response = await apiClient.createChargeHead(data);
      if (response.success) {
        alert("Charge head created successfully");
        setShowAddChargeHeadModal(false);
        loadData();
      }
    } catch (error) {
      alert("Error creating charge head");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (invoiceForm.target_type === "building") {
      if (!invoiceForm.building_id) {
        return alert("Please select a building / wing");
      }
    } else {
      if (!invoiceForm.building_id) {
        return alert("Please select a building first");
      }
      if (!invoiceForm.flat_id) {
        return alert("Please select a flat");
      }
    }

    if (
      invoiceItems.some(
        (i) => !i.charge_head_id || i.unit_price < 0 || i.quantity <= 0,
      )
    ) {
      return alert("Please completely fill all invoice items");
    }

    try {
      setSubmittingInvoice(true);
      const payload: any = {
        target_type: invoiceForm.target_type,
        building_id: invoiceForm.building_id,
        invoice_date: invoiceForm.invoice_date,
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes,
        items: invoiceItems,
      };

      if (invoiceForm.target_type === "flat") {
        payload.flat_id = invoiceForm.flat_id;
      }

      const response = await apiClient.createInvoice(payload);
      if (response.success) {
        alert(
          invoiceForm.target_type === "building"
            ? `Successfully created invoices for building residents!`
            : "Invoice created successfully!"
        );
        setShowCreateInvoiceModal(false);
        setInvoiceForm({
          target_type: "flat",
          building_id: "",
          flat_id: "",
          invoice_date: new Date().toISOString().split("T")[0],
          due_date: "",
          notes: "",
        });
        setInvoiceItems([{ charge_head_id: "", unit_price: 0, quantity: 1 }]);
        loadData();
      } else {
        alert(response.message || "Failed to create invoice");
      }
    } catch (error: any) {
      alert(error?.message || "Error creating invoice");
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await apiClient.updateInvoiceStatus(id, newStatus);
      if (res.success) {
        alert("Status updated");
        loadData();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("Error updating status");
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount),
    0,
  );
  const paidRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
  const pendingRevenue = invoices
    .filter((inv) => inv.status === "draft" || inv.status === "sent" || inv.status === "pending")
    .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <AdminPageShell
      icon={<Receipt className="w-6 h-6 text-emerald-600" />}
      title="Accounting & Finance"
      subtitle="Manage society invoices, collections, charge heads, and member dues"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddChargeHeadModal(true)}
            className="bg-blue-600 text-white px-3.5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-1.5 text-sm font-medium shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Charge Head</span>
          </button>
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center space-x-1.5 text-sm font-medium shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      }
    >
      <div>
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium ${activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("charge-heads")}
              className={`px-4 py-2 font-medium ${activeTab === "charge-heads"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Charge Heads ({chargeHeads.length})
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 font-medium ${activeTab === "invoices"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Invoices ({invoices.length})
            </button>
          </div>
        </div>

        <div className="w-full mx-auto px-4 py-6">
          {activeTab === "overview" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total Revenue"
                  value={`₹${totalRevenue.toLocaleString()}`}
                  icon={<DollarSign className="w-6 h-6 text-white" />}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Paid Revenue"
                  value={`₹${paidRevenue.toLocaleString()}`}
                  icon={<Receipt className="w-6 h-6 text-white" />}
                  color="bg-green-500"
                />
                <StatCard
                  title="Pending Revenue"
                  value={`₹${pendingRevenue.toLocaleString()}`}
                  icon={<Clock className="w-6 h-6 text-white" />}
                  color="bg-yellow-500"
                />
                <StatCard
                  title="Total Invoices"
                  value={invoices.length}
                  icon={<FileText className="w-6 h-6 text-white" />}
                  color="bg-purple-500"
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
                {invoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No invoices yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Resident
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoices.slice(0, 10).map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-6 py-4 font-medium">
                              {invoice.invoice_number}
                            </td>
                            <td className="px-6 py-4">
                              {invoice.resident_name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              ₹{Number(invoice.total_amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${invoice.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : invoice.status === "draft" || invoice.status === "pending"
                                    ? "bg-gray-100 text-gray-800"
                                    : invoice.status === "sent"
                                      ? "bg-blue-100 text-blue-800"
                                      : invoice.status === "overdue"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {invoice.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">{invoice.invoice_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "charge-heads" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Charge Heads</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        GST Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {chargeHeads.map((charge) => (
                      <tr key={charge.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{charge.name}</div>
                          {charge.description && (
                            <div className="text-sm text-gray-500">
                              {charge.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {charge.charge_type.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4">
                          ₹{Number(charge.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{charge.gst_rate}%</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${charge.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {charge.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Invoices</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Flat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 font-medium">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4">{invoice.flat_number}</td>
                        <td className="px-6 py-4">
                          ₹{Number(invoice.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "draft" || invoice.status === "pending"
                                ? "bg-gray-100 text-gray-800"
                                : invoice.status === "sent"
                                  ? "bg-blue-100 text-blue-800"
                                  : invoice.status === "overdue"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {invoice.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{invoice.due_date || "N/A"}</td>
                        <td className="px-6 py-4 text-right flex justify-end items-center">
                          {invoice.status !== "paid" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "paid")
                              }
                              className="text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded flex items-center space-x-1 transition"
                            >
                              <CheckCircle className="w-4 h-4" />{" "}
                              <span>Mark Paid</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Charge Head Modal */}
        {showAddChargeHeadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add Charge Head</h2>
              <form onSubmit={handleCreateChargeHead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charge Type
                  </label>
                  <select
                    name="charge_type"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="fixed">Fixed</option>
                    <option value="per_area">Per Area</option>
                    <option value="per_person">Per Person</option>
                    <option value="slab">Slab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    name="gst_rate"
                    step="0.01"
                    defaultValue="18"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddChargeHeadModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Add Charge Head
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Invoice Modal */}
        {showCreateInvoiceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                Create Invoice / Bill
              </h2>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                {/* Target Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Recipient *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setInvoiceForm({
                          ...invoiceForm,
                          target_type: "flat",
                          flat_id: "",
                        })
                      }
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${invoiceForm.target_type === "flat"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span>🏢 Single Flat (Choose Building ➔ Flat)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setInvoiceForm({
                          ...invoiceForm,
                          target_type: "building",
                          flat_id: "",
                        })
                      }
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${invoiceForm.target_type === "building"
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      <span>👥 Entire Building (All Residents)</span>
                    </button>
                  </div>
                </div>

                {/* Building Selection (Required for both) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Building / Wing *
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={invoiceForm.building_id}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          building_id: e.target.value,
                          flat_id: "", // Reset flat when building changes
                        })
                      }
                      required
                    >
                      <option value="">-- Choose Building / Wing --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.code ? `(${b.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* If Single Flat: Choose Flat filtered by selected building */}
                  {invoiceForm.target_type === "flat" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Flat *
                      </label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={invoiceForm.flat_id}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            flat_id: e.target.value,
                          })
                        }
                        disabled={!invoiceForm.building_id}
                        required
                      >
                        <option value="">
                          {!invoiceForm.building_id
                            ? "« Please select a building first"
                            : "-- Choose Flat --"}
                        </option>
                        {flats
                          .filter(
                            (f) =>
                              !invoiceForm.building_id ||
                              f.building_id?.toString() === invoiceForm.building_id.toString()
                          )
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              Flat {f.flat_number} {f.owner_name ? `(${f.owner_name})` : ""}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Scope Info
                      </label>
                      <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs leading-relaxed">
                        {invoiceForm.building_id ? (
                          <>
                            Generating invoices for{" "}
                            <strong>
                              {
                                flats.filter(
                                  (f) =>
                                    f.building_id?.toString() ===
                                    invoiceForm.building_id.toString()
                                ).length
                              }{" "}
                              flats
                            </strong>{" "}
                            in the selected building.
                          </>
                        ) : (
                          "Select a building to preview target flat count."
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Date & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={invoiceForm.invoice_date}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoice_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={invoiceForm.due_date}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">Invoice Items</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setInvoiceItems([
                          ...invoiceItems,
                          { charge_head_id: "", unit_price: 0, quantity: 1 },
                        ])
                      }
                      className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
                    >
                      + Add Item
                    </button>
                  </div>

                  {invoiceItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex space-x-3 items-end mb-3 bg-gray-50 p-3 rounded border"
                    >
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Charge Head *
                        </label>
                        <select
                          className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          value={item.charge_head_id}
                          onChange={(e) => {
                            const selected = chargeHeads.find(
                              (c) => c.id.toString() === e.target.value,
                            );
                            const newItems = [...invoiceItems];
                            newItems[index].charge_head_id = e.target.value;
                            if (selected)
                              newItems[index].unit_price = Number(
                                selected.amount,
                              );
                            setInvoiceItems(newItems);
                          }}
                          required
                        >
                          <option value="">-- Select --</option>
                          {chargeHeads.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} (₹{c.amount})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          value={item.unit_price}
                          onChange={(e) => {
                            const newItems = [...invoiceItems];
                            newItems[index].unit_price =
                              parseFloat(e.target.value) || 0;
                            setInvoiceItems(newItems);
                          }}
                          required
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Qty *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-2 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...invoiceItems];
                            newItems[index].quantity =
                              parseFloat(e.target.value) || 1;
                            setInvoiceItems(newItems);
                          }}
                          required
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setInvoiceItems(
                              invoiceItems.filter((_, i) => i !== index),
                            )
                          }
                          className="text-red-500 hover:text-red-700 px-2 py-1 mb-1 transition"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={invoiceForm.notes}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, notes: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="flex space-x-4 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(false)}
                    disabled={submittingInvoice}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvoice}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
                  >
                    {submittingInvoice
                      ? "Generating Invoice(s)..."
                      : invoiceForm.target_type === "building"
                        ? "Generate Building Invoices"
                        : "Create Flat Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
};

export default function AccountingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500 font-medium">Loading finance module...</div>
        </div>
      }
    >
      <AccountingManagement />
    </Suspense>
  );
}
