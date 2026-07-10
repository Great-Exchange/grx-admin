import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Gift,
  Settings,
  X,
  AlertCircle,
  CreditCard,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import Modal from "../components/Modal";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import giftCardStoreService from "../services/giftCardStoreService";
import accountUpgradeService from "../services/accountUpgradeService";
import withdrawalService from "../services/withdrawalService";
import transactionService from "../services/transactionService";
import userService from "../services/userService";
import WithdrawalDetail from "../pages/WithdrawalDetail";
import { Outlet, useLocation } from "react-router-dom";

export default function AdminDashboard({ setIsAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalEditData, setModalEditData] = useState(null);

  // ── API data ─────────────────────────────────────────────────────
  const [giftCardStores, setGiftCardStores] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [level2Requests, setLevel2Requests] = useState([]);
  const [level3Requests, setLevel3Requests] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Drives the WithdrawalDetail modal — null = closed
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { id: "overview", icon: BarChart3, label: "Overview" },
    { id: "giftcards", icon: Gift, label: "Gift Cards" },
    { id: "upgrades", icon: CreditCard, label: "Upgrades" },
    { id: "withdrawals", icon: DollarSign, label: "Withdrawals" },
    { id: "transactions", icon: ShoppingBag, label: "Transactions" },
    { id: "users", icon: Users, label: "Users" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        storesRes,
        cardsRes,
        usersRes,
        level2Res,
        level3Res,
        withdrawalsRes,
        transactionsRes,
      ] = await Promise.allSettled([
        giftCardStoreService.getAllStores(),
        giftCardStoreService.getAllGiftCards(),
        userService.getAllUsers(),
        accountUpgradeService.getPendingLevel2Requests(),
        accountUpgradeService.getPendingLevel3Requests(),
        withdrawalService.getAllWithdrawals(),
        transactionService.getAllTransactions(),
      ]);

      if (storesRes.status === "fulfilled") {
        console.log(storesRes.value.data);
        setGiftCardStores(storesRes.value.data);
      } else console.error("❌ Stores:", storesRes.reason);

      if (cardsRes.status === "fulfilled") setGiftCards(cardsRes.value.data);
      else console.error("❌ Gift cards:", cardsRes.reason);

      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
      else console.error("❌ Users:", usersRes.reason);

      if (level2Res.status === "fulfilled") {
        console.log(level2Res.value.data);
        setLevel2Requests(level2Res.value.data);
      } else console.error("❌ Level 2:", level2Res.reason);

      if (level3Res.status === "fulfilled")
        setLevel3Requests(level3Res.value.data);
      else console.error("❌ Level 3:", level3Res.reason);

      if (withdrawalsRes.status === "fulfilled")
        setWithdrawals(withdrawalsRes.value.data);
      else console.error("❌ Withdrawals:", withdrawalsRes.reason);

      if (transactionsRes.status === "fulfilled")
        setTransactions(transactionsRes.value.data);
      else console.error("❌ Transactions:", transactionsRes.reason);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("❌ fetchAllData:", err);
    } finally {
      setLoading(false);
    }
  };

  // Targeted refreshes — never patch state manually
  const fetchGiftCardData = async () => {
    try {
      const [storesRes, cardsRes] = await Promise.all([
        giftCardStoreService.getAllStores(),
        giftCardStoreService.getAllGiftCards(),
      ]);
      setGiftCardStores(storesRes.data);
      setGiftCards(cardsRes.data);
    } catch (err) {
      setError("Failed to refresh gift card data.");
      console.error("❌ fetchGiftCardData:", err);
    }
  };

  // Called by WithdrawalDetail after approve/reject
  const fetchWithdrawals = async () => {
    try {
      const res = await withdrawalService.getAllWithdrawals();
      setWithdrawals(res.data);
    } catch (err) {
      setError("Failed to refresh withdrawals.");
      console.error("❌ fetchWithdrawals:", err);
    }
  };

  // Called by Transactions page after a status update
  const fetchTransactions = async () => {
    try {
      const res = await transactionService.getAllTransactions();
      setTransactions(res.data);
    } catch (err) {
      setError("Failed to refresh transactions.");
      console.error("❌ fetchTransactions:", err);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────
  const pendingWithdrawalsCount = withdrawals.filter(
    (w) => w.status?.toLowerCase() === "pending",
  ).length;

  const pendingTransactionsCount = transactions.filter(
    (t) => t.status?.toLowerCase() === "pending",
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: users.length.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Gift Cards",
      value: giftCards.length.toLocaleString(),
      icon: Gift,
      color: "bg-purple-500",
    },
    {
      label: "Pending Upgrades",
      value: (level2Requests.length + level3Requests.length).toLocaleString(),
      icon: CreditCard,
      color: "bg-green-500",
    },
    {
      label: "Pending Withdrawals",
      value: pendingWithdrawalsCount.toLocaleString(),
      icon: DollarSign,
      color: "bg-orange-500",
    },
    {
      label: "Pending Transactions",
      value: pendingTransactionsCount.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-pink-500",
    },
  ];

  // ── Auth ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
  };

  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split("/")[2] || "overview";

    const titles = {
      overview: "Overview",
      giftcards: "Gift Cards",
      upgrades: "Account Upgrades",
      withdrawals: "Withdrawals",
      transactions: "Transactions",
      users: "Users",
      settings: "Settings",
    };

    return titles[path] || "Overview";
  };

  // ── Modal ────────────────────────────────────────────────────────
  const openModal = (type, editData = null) => {
    setModalType(type);
    setModalEditData(editData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalEditData(null);
  };

  // ── Gift Card Store handlers ─────────────────────────────────────
  const handleCreateStore = async () => {
    try {
      await fetchGiftCardData();
      closeModal();
      setError(null);
    } catch (err) {
      console.error("❌ handleCreateStore:", err);
      setError("Store created but failed to refresh. Please reload.");
    }
  };

  const handleUpdateStore = async () => {
    try {
      await fetchGiftCardData();
      closeModal();
      setError(null);
    } catch (err) {
      console.error("❌ handleUpdateStore:", err);
      setError("Store updated but failed to refresh. Please reload.");
    }
  };

  const handleDeleteStore = async (id) => {
    try {
      await giftCardStoreService.deleteStore(id);
      setGiftCardStores((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("Failed to delete store.");
      console.error("❌ handleDeleteStore:", err);
    }
  };

  // ── Gift Card handlers ───────────────────────────────────────────
  const handleCreateCard = async () => {
    try {
      await fetchGiftCardData();
      closeModal();
      setError(null);
    } catch (err) {
      console.error("❌ handleCreateCard:", err);
      setError("Card created but failed to refresh. Please reload.");
    }
  };

  const handleUpdateGiftCard = async () => {
    try {
      await fetchGiftCardData();
      closeModal();
      setError(null);
    } catch (err) {
      console.error("❌ handleUpdateGiftCard:", err);
      setError("Card updated but failed to refresh. Please reload.");
    }
  };

  const handleDeleteGiftCard = async (id) => {
    try {
      await giftCardStoreService.deleteGiftCard(id);
      setGiftCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError("Failed to delete gift card.");
      console.error("❌ handleDeleteGiftCard:", err);
    }
  };

  // ── Upgrade handlers ─────────────────────────────────────────────
  const handleApproveUpgrade = async (credentialId, level) => {
    try {
      if (level === 2) {
        await accountUpgradeService.approveLevel2(credentialId);
        setLevel2Requests((prev) => prev.filter((r) => r.id !== credentialId));
      } else {
        await accountUpgradeService.approveLevel3(credentialId);
        setLevel3Requests((prev) => prev.filter((r) => r.id !== credentialId));
      }
      setError(null);
    } catch (err) {
      setError(`Failed to approve level ${level} upgrade.`);
      console.error("❌ handleApproveUpgrade:", err);
    }
  };

  const handleRejectUpgrade = async (credentialId, level) => {
    try {
      if (level === 2) {
        await accountUpgradeService.rejectLevel2(credentialId);
        setLevel2Requests((prev) => prev.filter((r) => r.id !== credentialId));
      } else {
        await accountUpgradeService.rejectLevel3(credentialId);
        setLevel3Requests((prev) => prev.filter((r) => r.id !== credentialId));
      }
      setError(null);
    } catch (err) {
      setError(`Failed to reject level ${level} upgrade.`);
      console.error("❌ handleRejectUpgrade:", err);
    }
  };

  // ------------------------------TRANSACTION HANDLERS---------------------------
  const handleTransactionStatusUpdate = async (transactionId, payload) => {
    try {
      await transactionService.updateTransactionStatus(transactionId, payload);

      // Refresh transaction list
      await fetchTransactions();

      setError(null);
    } catch (err) {
      console.error("❌ handleTransactionStatusUpdate:", err);

      setError("Failed to update transaction status.");

      throw err;
    }
  };
  // ── Modal submit router ──────────────────────────────────────────
  const getModalSubmitHandler = () => {
    if (modalType === "create-store") return handleCreateStore;
    if (modalType === "edit-store") return handleUpdateStore;
    if (modalType === "create-card") return handleCreateCard;
    if (modalType === "edit-card") return handleUpdateGiftCard;
    return () => closeModal();
  };

  // ── Tab renderer ─────────────────────────────────────────────────

  const outletContext = {
    // Dashboard data
    stats,
    giftCardStores,
    giftCards,
    users,
    level2Requests,
    level3Requests,
    withdrawals,
    transactions,

    // UI state
    loading,
    error,
    setError,

    // Modal
    openModal,
    closeModal,

    // Refresh methods
    fetchGiftCardData,
    fetchWithdrawals,
    fetchTransactions,

    // Upgrade handlers
    handleApproveUpgrade,
    handleRejectUpgrade,

    // Transaction handlers
    handleTransactionStatusUpdate,

    // Gift card handlers
    handleDeleteStore,
    handleDeleteGiftCard,

    // User handlers
    setUsers,

    // Withdrawal modal
    // Withdrawal modal
    selectedWithdrawalId,
    setSelectedWithdrawalId,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        menuItems={menuItems}
        handleLogout={handleLogout}
      />
      <div
        className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 flex flex-col overflow-hidden transition-all duration-300`}
      >
        <Header pageTitle={getPageTitle()} />

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>

      {/* Gift Card / User Modal */}
      {showModal && (
        <Modal
          type={modalType}
          editData={modalEditData}
          onClose={closeModal}
          onSubmit={getModalSubmitHandler()}
          giftCardStores={giftCardStores}
        />
      )}

      {/* WithdrawalDetail — opens when a withdrawal row is clicked */}
      {selectedWithdrawalId && (
        <WithdrawalDetail
          withdrawalId={selectedWithdrawalId}
          onClose={() => setSelectedWithdrawalId(null)}
          onProcessed={() => {
            fetchWithdrawals();
            setSelectedWithdrawalId(null);
          }}
        />
      )}
    </div>
  );
}
