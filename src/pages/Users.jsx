import React, { useState } from "react";
import { Loader, Search, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";

function UsersTab() {
  const { users = [], loading } = useOutletContext();

  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return (
      (user.full_name || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term) ||
      (user.phone_number || "").toLowerCase().includes(term) ||
      (user.level || "").toLowerCase().includes(term) ||
      String(user.id).includes(term)
    );
  });

  const formatCurrency = (amount) => {
    const value = parseFloat(amount);

    if (isNaN(value)) return "₦0.00";

    return `₦${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case "Level 3":
        return "bg-purple-100 text-purple-800";

      case "Level 2":
        return "bg-blue-100 text-blue-800";

      case "Level 1":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="animate-spin text-purple-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">User Management</h3>

        <div className="bg-white rounded-xl shadow py-12 text-center">
          <Users size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No users found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">User Management</h3>

        <p className="text-sm text-gray-500">
          {users.length} total user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search by ID, name, email, phone or level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No users match your search.
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
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Level
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Transaction Limit
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      #{user.id}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.full_name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone_number || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelBadge(
                          user.level,
                        )}`}
                      >
                        {user.level || "Level 1"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {formatCurrency(user.transaction_limit)}
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

export default UsersTab;
