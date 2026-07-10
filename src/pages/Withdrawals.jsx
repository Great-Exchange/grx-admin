import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Eye,
  Calendar,
  Search,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function Withdrawals() {
  const { withdrawals, loading, setSelectedWithdrawalId } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="text-purple-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow">
        <p className="text-gray-600">No withdrawal requests found</p>
      </div>
    );
  }

  // API returns status as "Pending", "Approved", "Rejected" (capitalised)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle size={14} className="text-green-600" />;
      case "rejected":
        return <XCircle size={14} className="text-red-600" />;
      case "pending":
        return <AlertCircle size={14} className="text-yellow-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Naira formatter — API returns amount as a string like "-0500621978"
  const formatNaira = (amount) => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return "₦—";
    return `₦${Math.abs(parsed).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Summary counts
  const pending = withdrawals.filter(
    (w) => w.status?.toLowerCase() === "pending",
  ).length;
  const approved = withdrawals.filter(
    (w) => w.status?.toLowerCase() === "approved",
  ).length;
  const rejected = withdrawals.filter(
    (w) => w.status?.toLowerCase() === "rejected",
  ).length;
  const totalAmount = withdrawals.reduce(
    (sum, w) => sum + Math.abs(parseFloat(w.amount) || 0),
    0,
  );

  // Filter
  const filtered = withdrawals.filter((w) => {
    const matchesStatus =
      statusFilter === "all" || w.status?.toLowerCase() === statusFilter;
    const matchesSearch = search === "" || String(w.id).includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h3 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {withdrawals.length}
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
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-xl font-bold text-gray-900">
            {formatNaira(totalAmount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status pills */}
        {["all", "pending", "approved", "rejected"].map((s) => (
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

        {/* ID search */}
        <div className="relative ml-auto">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No withdrawals match your filter.
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      #{withdrawal.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatNaira(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}
                      >
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status_display || withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(withdrawal.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(withdrawal.updated_at).toLocaleDateString(
                        "en-NG",
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => setSelectedWithdrawalId(withdrawal.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          withdrawal.status?.toLowerCase() === "pending"
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <Eye size={15} />
                        {withdrawal.status?.toLowerCase() === "pending"
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
    </div>
  );
}

export default Withdrawals;
