import React, { useState } from "react";
import {
  Loader,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return <CheckCircle size={14} className="text-green-600" />;
    case "rejected":
      return <XCircle size={14} className="text-red-600" />;
    case "pending":
      return <Clock size={14} className="text-yellow-600" />;
    default:
      return <AlertCircle size={14} className="text-gray-400" />;
  }
};

// ── TransactionDetailModal ───────────────────────────────────────────────────

function TransactionDetailModal({
  transaction,
  onClose,
  onStatusUpdated,
  onUpdateStatus,
}) {
  const [status, setStatus] = useState(transaction.status || "Pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const hasChanged = status !== transaction.status;

  const handleUpdate = async () => {
    if (!hasChanged) return;
    setError(null);
    setSuccess(null);
    setProcessing(true);
    try {
      await onUpdateStatus(transaction.id, {
        status,
        admin_notes: adminNotes,
      });
      setSuccess(`Status updated to "${status}" successfully!`);
      setTimeout(() => {
        onStatusUpdated();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to update status.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const user = transaction.user || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Transaction #{transaction.id}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
              >
                {getStatusIcon(transaction.status)}
                {transaction.status}
              </span>
              <span className="text-xs text-gray-400">
                Type: {transaction.type || "—"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Amount highlight */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Amount</p>
              <p className="text-3xl font-bold text-purple-900 mt-0.5">
                ₦
                {parseFloat(transaction.amount || 0).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-purple-700" />
            </div>
          </div>

          {/* Card info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              Card Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Card ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.card ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.type || "—"}
                </p>
              </div>
              {transaction.e_code_pin && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">E-Code / PIN</p>
                  <p className="text-sm font-mono font-semibold text-gray-900 tracking-widest">
                    {transaction.e_code_pin}
                  </p>
                </div>
              )}
            </div>

            {/* Card image (Physical type) */}
            {transaction.image && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Card Image</p>
                <img
                  src={transaction.image}
                  alt="Gift card"
                  className="max-w-xs w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* User info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              User Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.full_name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.phone_number || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Level</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.level === "Level 3"
                      ? "bg-purple-100 text-purple-800"
                      : user.level === "Level 2"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.level || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Update status form */}
          <div className="bg-white border-2 border-purple-200 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-gray-900">Update Status</h4>

            {/* Status selector */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              {STATUS_OPTIONS.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => setStatus(opt)}
                  className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition
                    ${idx > 0 ? "border-l border-gray-300" : ""}
                    ${
                      status === opt
                        ? opt === "Approved"
                          ? "bg-green-600 text-white"
                          : opt === "Rejected"
                            ? "bg-red-600 text-white"
                            : "bg-yellow-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {opt === "Approved" && <CheckCircle size={14} />}
                  {opt === "Rejected" && <XCircle size={14} />}
                  {opt === "Pending" && <Clock size={14} />}
                  {opt}
                </button>
              ))}
            </div>

            {/* Admin notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Admin Notes{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="Internal notes about this transaction..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={processing || !hasChanged}
            className={`px-6 py-2 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium
              ${
                !hasChanged
                  ? "bg-gray-300 cursor-not-allowed"
                  : status === "Approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : status === "Rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-500 hover:bg-yellow-600"
              } disabled:opacity-60`}
          >
            {processing ? (
              <>
                <Loader size={15} className="animate-spin" /> Updating...
              </>
            ) : (
              <>
                <CheckCircle size={15} /> Save Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Transactions (main page) ─────────────────────────────────────────────────

function Transactions() {
  const {
    transactions,
    loading,
    handleTransactionStatusUpdate,
    fetchTransactions,
  } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="text-purple-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow">
        <ShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No transactions found</p>
      </div>
    );
  }

  // Summary counts
  const pending = transactions.filter(
    (t) => t.status?.toLowerCase() === "pending",
  ).length;
  const approved = transactions.filter(
    (t) => t.status?.toLowerCase() === "approved",
  ).length;
  const rejected = transactions.filter(
    (t) => t.status?.toLowerCase() === "rejected",
  ).length;

  // Filtered rows
  const filtered = transactions.filter((t) => {
    const matchesStatus =
      statusFilter === "all" ||
      t.status?.toLowerCase() === statusFilter.toLowerCase();

    const term = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      String(t.id).includes(term) ||
      t.user?.full_name?.toLowerCase().includes(term) ||
      t.user?.email?.toLowerCase().includes(term) ||
      t.type?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <h3 className="text-2xl font-bold text-gray-900">Transactions</h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {transactions.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-500">{rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {["all", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}

        <div className="relative ml-auto">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by ID, user, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No transactions match your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      #{txn.id}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-gray-900">
                        {txn.user?.full_name || "—"}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {txn.user?.email || ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          txn.type === "Physical"
                            ? "bg-green-100 text-green-800"
                            : txn.type === "E-Code"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {txn.type || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₦
                      {parseFloat(txn.amount || 0).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}
                      >
                        {getStatusIcon(txn.status)}
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedTransaction(txn)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          txn.status?.toLowerCase() === "pending"
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Eye size={15} />
                        {txn.status?.toLowerCase() === "pending"
                          ? "Review"
                          : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdateStatus={handleTransactionStatusUpdate}
          onStatusUpdated={() => {
            setSelectedTransaction(null);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}

export default Transactions;
