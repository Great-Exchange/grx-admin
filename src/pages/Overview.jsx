import React from "react";
import { useOutletContext } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import { Loader } from "lucide-react";

const Overview = (props = {}) => {
  const context = useOutletContext() || {};

  const {
    stats = props.stats,
    giftCardStores = props.giftCardStores,
    giftCards = props.giftCards,
    users = props.users,
    withdrawals = props.withdrawals,
    loading = props.loading,
  } = context;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="text-[#FF006A] animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCards = giftCards?.length || 0;
  const totalStores = giftCardStores?.length || 0;
  const topStore = giftCardStores?.[0] || null;
  const topStoreCardCount =
    giftCards?.filter((c) => c.store?.id === topStore?.id).length || 0;

  // API returns "Pending" with capital P — compare case-insensitively
  const pendingWithdrawals =
    withdrawals?.filter((w) => w.status?.toLowerCase() === "pending") || [];

  const totalWithdrawalAmount = withdrawals?.reduce(
    (sum, w) => sum + Math.abs(parseFloat(w.amount) || 0),
    0,
  );

  const recentUsers = users?.slice(0, 5) || [];
  const recentStores = giftCardStores?.slice(0, 5) || [];

  const formatNaira = (amount) =>
    `₦${parseFloat(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Top Store</h3>
          <p className="text-3xl font-bold truncate">
            {topStore?.name || "N/A"}
          </p>
          <p className="text-blue-100 text-sm mt-2">
            {topStoreCardCount} gift card{topStoreCardCount !== 1 ? "s" : ""} •{" "}
            {topStore?.category || "—"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Stores</h3>
          <p className="text-3xl font-bold">{totalStores}</p>
          <p className="text-green-100 text-sm mt-2">
            {totalCards} total gift card{totalCards !== 1 ? "s" : ""} across all
            stores
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Withdrawals</h3>
          <p className="text-3xl font-bold">
            {formatNaira(totalWithdrawalAmount)}
          </p>
          <p className="text-orange-100 text-sm mt-2">
            {pendingWithdrawals.length} pending withdrawal
            {pendingWithdrawals.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Recent Gift Card Stores Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Gift Card Stores
          </h3>
        </div>
        <div className="overflow-x-auto">
          {recentStores.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-500">
              No stores found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Store Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Gift Cards
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStores.map((store) => {
                  const cardCount =
                    giftCards?.filter((c) => c.store?.id === store.id).length ||
                    store.cards?.length ||
                    0;
                  return (
                    <tr
                      key={store.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {store.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {store.category || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cardCount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            store.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {store.status || "active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          {recentUsers.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
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
                {recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {user.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone_number || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.level || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {formatNaira(user.transaction_limit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
