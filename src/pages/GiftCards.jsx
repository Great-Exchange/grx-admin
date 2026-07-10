import {
  Edit2,
  Plus,
  Trash2,
  Loader,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { ConfirmationModal } from "../components/Modal";
import { useOutletContext } from "react-router-dom";

function GiftCards() {
  const {
    giftCardStores,
    giftCards,
    loading,
    openModal,
    handleDeleteStore,
    handleDeleteGiftCard,
  } = useOutletContext();

  const [expandedStore, setExpandedStore] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'delete-store' | 'delete-card' | 'edit-store' | 'edit-card'
    targetId: null,
    targetName: "",
    targetData: null,
    isProcessing: false,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="text-purple-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading gift card stores...</p>
        </div>
      </div>
    );
  }

  if (!giftCardStores || giftCardStores.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow">
        <p className="text-gray-600 mb-4">No gift card stores found</p>
        <button
          onClick={() => openModal("create-store")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 mx-auto"
        >
          <Plus size={18} /> Create First Store
        </button>
      </div>
    );
  }

  // GET /admin/list-gift-cards returns: { id, name, rate, type, store: { id, name } }
  // We filter cards by store id to group them under each store
  const getStoreGiftCards = (storeId) => {
    return giftCards?.filter((card) => card.store?.id === storeId) || [];
  };

  const resetConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      targetId: null,
      targetName: "",
      targetData: null,
      isProcessing: false,
    });
  };

  // ── Delete handlers ──────────────────────────────────────────────
  const handleDeleteStoreClick = (storeId, storeName) => {
    setConfirmModal({
      isOpen: true,
      type: "delete-store",
      targetId: storeId,
      targetName: storeName,
      targetData: null,
      isProcessing: false,
    });
  };

  const handleDeleteCardClick = (cardId, cardName) => {
    setConfirmModal({
      isOpen: true,
      type: "delete-card",
      targetId: cardId,
      targetName: cardName,
      targetData: null,
      isProcessing: false,
    });
  };

  // ── Edit handlers ────────────────────────────────────────────────
  // Store GET shape: { id, name }
  // Modal will pre-fill name; category/image/cards are re-entered by admin
  const handleEditStoreClick = (store) => {
    setConfirmModal({
      isOpen: true,
      type: "edit-store",
      targetId: store.id,
      targetName: store.name,
      targetData: store,
      isProcessing: false,
    });
  };

  // Card GET shape: { id, name, rate, type, store: { id, name } }
  const handleEditCardClick = (card) => {
    setConfirmModal({
      isOpen: true,
      type: "edit-card",
      targetId: card.id,
      targetName: card.name,
      targetData: card,
      isProcessing: false,
    });
  };

  // ── Confirm action ───────────────────────────────────────────────
  const handleConfirmAction = async () => {
    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
    try {
      if (confirmModal.type === "delete-store") {
        await handleDeleteStore(confirmModal.targetId);
      } else if (confirmModal.type === "delete-card") {
        await handleDeleteGiftCard(confirmModal.targetId);
      } else if (confirmModal.type === "edit-store") {
        openModal("edit-store", confirmModal.targetData);
      } else if (confirmModal.type === "edit-card") {
        openModal("edit-card", confirmModal.targetData);
      }
      resetConfirmModal();
    } catch (error) {
      console.error("Error during action:", error);
      setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // ── Confirmation modal copy ──────────────────────────────────────
  const getConfirmModalProps = () => {
    const { type, targetName } = confirmModal;
    if (type === "delete-store") {
      return {
        title: "Delete Store",
        message: `Delete "${targetName}"?`,
        description:
          "This will permanently delete the store and all its associated gift cards.",
        confirmText: "Delete",
        modalType: "danger",
      };
    }
    if (type === "delete-card") {
      return {
        title: "Delete Gift Card",
        message: `Delete "${targetName}"?`,
        description: "This will permanently delete this gift card.",
        confirmText: "Delete",
        modalType: "danger",
      };
    }
    if (type === "edit-store") {
      return {
        title: "Edit Store",
        message: `Edit "${targetName}"?`,
        description:
          "You will be able to update the store name, category, image and cards.",
        confirmText: "Edit",
        modalType: "info",
      };
    }
    if (type === "edit-card") {
      return {
        title: "Edit Gift Card",
        message: `Edit "${targetName}"?`,
        description: "You will be able to update this gift card's details.",
        confirmText: "Edit",
        modalType: "info",
      };
    }
    return {
      title: "",
      message: "",
      description: "",
      confirmText: "Confirm",
      modalType: "info",
    };
  };

  const confirmProps = getConfirmModalProps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">
          Gift Card Stores & Cards
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal("create-card")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={18} /> Create Gift Card
          </button>
          <button
            onClick={() => openModal("create-store")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={18} /> Create Store
          </button>
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-3">
        {(giftCardStores || []).map((store) => {
          // GET /admin/list-gift-stores returns: { id, name }
          // card count is derived from the giftCards array, not the store object
          const storeCards = getStoreGiftCards(store.id);
          const isExpanded = expandedStore === store.id;

          return (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition"
            >
              {/* Store Header */}
              <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedStore(isExpanded ? null : store.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {store.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {storeCards.length} gift card
                      {storeCards.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Store Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStoreClick(store);
                    }}
                    className="p-2 hover:bg-yellow-50 rounded text-yellow-600 transition"
                    title="Edit store"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStoreClick(store.id, store.name);
                    }}
                    className="p-2 hover:bg-red-50 rounded text-red-600 transition"
                    title="Delete store"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Gift Cards Table — Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Card Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Rate
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeCards.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              <div className="flex flex-col items-center gap-3">
                                <p>No gift cards for this store yet</p>
                                <button
                                  onClick={() => openModal("create-card")}
                                  className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition"
                                >
                                  Add Gift Card
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          storeCards.map((card) => (
                            // Card shape: { id, name, rate, type, store: { id, name } }
                            <tr
                              key={card.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                {card.name}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    card.type === "Both"
                                      ? "bg-blue-100 text-blue-800"
                                      : card.type === "Physical"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {card.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                ₦
                                {parseFloat(card.rate || 0).toLocaleString(
                                  "en-NG",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCardClick(card);
                                  }}
                                  className="p-1 hover:bg-yellow-50 rounded text-yellow-600 transition inline-block"
                                  title="Edit card"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCardClick(card.id, card.name);
                                  }}
                                  className="p-1 hover:bg-red-50 rounded text-red-600 transition inline-block"
                                  title="Delete card"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmProps.title}
        message={confirmProps.message}
        description={confirmProps.description}
        confirmText={confirmProps.confirmText}
        type={confirmProps.modalType}
        onConfirm={handleConfirmAction}
        onCancel={resetConfirmModal}
        isLoading={confirmModal.isProcessing}
      />
    </div>
  );
}

export default GiftCards;
