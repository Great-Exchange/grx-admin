import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import giftCardStoreService from "../services/giftCardStoreService";

// ── Helper: convert a File to base64 string ──────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function ModalComponent({
  type,
  onClose,
  onSubmit,
  giftCardStores = [],
  editData = null,
}) {
  const [formData, setFormData] = useState({});
  const [cards, setCards] = useState([{ type: "Both", name: "", rate: "" }]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // keep File separate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // For searchable store select (create-card / edit-card)
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const dropdownRef = useRef(null);

  const formConfigs = {
    "create-store": {
      title: "Create Gift Card Store",
      fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "image", label: "Image", type: "file" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: ["Popular", "Shopping"],
        },
      ],
    },
    "edit-store": {
      title: "Edit Gift Card Store",
      fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "image", label: "Image", type: "file" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: ["Popular", "Shopping"],
        },
      ],
    },
    "create-card": {
      title: "Create Gift Card",
      fields: [],
    },
    "edit-card": {
      title: "Edit Gift Card",
      fields: [],
    },
    "create-user": {
      title: "Add User",
      fields: [
        { name: "name", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["active", "inactive"],
        },
      ],
    },
    "edit-user": {
      title: "Edit User",
      fields: [
        { name: "name", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["active", "inactive"],
        },
      ],
    },
  };

  const config = formConfigs[type] || { title: "Form", fields: [] };

  // PRE-FILL form when editData is provided
  useEffect(() => {
    if (editData) {
      setFormData(editData);

      if (
        type === "edit-store" &&
        editData.cards &&
        editData.cards.length > 0
      ) {
        setCards(
          editData.cards.map((c) => ({
            type: c.type || "Both",
            name: c.name || "",
            rate: c.rate || "",
          })),
        );
      }

      if (type === "edit-card") {
        const storeId = editData.store?.id || editData.store;
        const storeObj = giftCardStores.find((s) => s.id === storeId);
        if (storeObj) {
          setSelectedStoreId(storeObj.id);
          setStoreSearchTerm(storeObj.name);
        }
      }
    }
  }, [editData, type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (fieldName) => (e) => {
    setFormData({ ...formData, [fieldName]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const addCard = () => {
    setCards([...cards, { type: "Both", name: "", rate: "" }]);
  };

  const removeCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const filteredStores = giftCardStores.filter((store) =>
    store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()),
  );

  const selectStore = (storeId, storeName) => {
    setSelectedStoreId(storeId);
    setFormData({ ...formData, store: storeId });
    setStoreSearchTerm(storeName);
    setShowStoreDropdown(false);
  };

  // ── Extract a readable error message from an Axios error ─────────────────
  const extractError = (err) => {
    const data = err.response?.data;
    if (!data) return err.message || "An unexpected error occurred.";

    // DRF often returns { field: ["msg"], detail: "msg", non_field_errors: [...] }
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors.join(" ");

    // Flatten field-level errors into one readable string
    const messages = Object.entries(data)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        return `${field}: ${text}`;
      })
      .join(" | ");
    return messages || "Failed to save. Please check your input.";
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    // ── CREATE / EDIT STORE ──────────────────────────────────────────
    if (type === "create-store" || type === "edit-store") {
      if (!formData.name?.trim()) {
        setError("Store name is required");
        return;
      }
      if (!formData.category) {
        setError("Category is required");
        return;
      }
      if (cards.length === 0) {
        setError("Add at least one gift card");
        return;
      }
      for (let card of cards) {
        if (!card.name?.trim()) {
          setError("All cards must have a name");
          return;
        }
        if (!card.rate) {
          setError("All cards must have a rate");
          return;
        }
      }

      setLoading(true);
      try {
        // Build the cards array — match API spec exactly
        const cardsPayload = cards.map((card) => ({
          type: card.type || "Both",
          name: card.name.trim(),
          rate: String(parseFloat(card.rate)), // API spec shows rate as string
        }));

        // The API accepts multipart/form-data.
        // `cards` must be sent as a JSON string in the form field —
        // this is the standard DRF pattern when mixing file uploads with nested data.
        const fd = new FormData();
        fd.append("name", formData.name.trim());
        fd.append("category", formData.category);
        fd.append("cards", JSON.stringify(cardsPayload));

        // Image: only append if a new file was selected
        if (imageFile instanceof File) {
          fd.append("image", imageFile);
        }
        // If editing and no new image selected, omit the image field entirely
        // so the backend keeps the existing one.

        // Debug: log what we're sending
        console.log("📤 Store payload:");
        for (let [key, val] of fd.entries()) {
          console.log(`  ${key}:`, val);
        }

        let response;
        if (type === "create-store") {
          response = await giftCardStoreService.createStore(fd);
          setSuccess("Store created successfully!");
        } else {
          response = await giftCardStoreService.updateStore(editData.id, fd);
          setSuccess("Store updated successfully!");
        }

        console.log("✅ Response:", response.data);
        setTimeout(() => onSubmit(response.data), 1500);
      } catch (err) {
        console.error("❌ Store save error:", err.response?.data || err);
        setError(extractError(err));
        setLoading(false);
      }

      // ── CREATE CARD ──────────────────────────────────────────────────
    } else if (type === "create-card") {
      if (!formData.type) {
        setError("Type is required");
        return;
      }
      if (!formData.name?.trim()) {
        setError("Card name is required");
        return;
      }
      if (!formData.rate) {
        setError("Rate is required");
        return;
      }
      if (!selectedStoreId) {
        setError("Please select a store");
        return;
      }

      setLoading(true);
      try {
        const giftCardData = {
          type: formData.type,
          name: formData.name.trim(),
          rate: parseFloat(formData.rate),
          store: selectedStoreId,
        };
        console.log("🎴 Creating gift card:", giftCardData);
        const response =
          await giftCardStoreService.createGiftCard(giftCardData);
        console.log("✅ Gift Card Created:", response.data);
        setSuccess("Gift card created successfully!");
        setTimeout(() => onSubmit(response.data), 1500);
      } catch (err) {
        console.error("❌ Gift card create error:", err.response?.data || err);
        setError(extractError(err));
        setLoading(false);
      }

      // ── EDIT CARD ────────────────────────────────────────────────────
    } else if (type === "edit-card") {
      if (!formData.type) {
        setError("Type is required");
        return;
      }
      if (!formData.name?.trim()) {
        setError("Card name is required");
        return;
      }
      if (!formData.rate) {
        setError("Rate is required");
        return;
      }
      const resolvedStoreId =
        selectedStoreId || editData?.store?.id || editData?.store;
      if (!resolvedStoreId) {
        setError("Please select a store");
        return;
      }

      setLoading(true);
      try {
        const giftCardData = {
          type: formData.type,
          name: formData.name.trim(),
          rate: parseFloat(formData.rate),
          store: resolvedStoreId,
        };
        console.log("🎴 Updating gift card ID:", editData.id, giftCardData);
        const response = await giftCardStoreService.updateGiftCard(
          editData.id,
          giftCardData,
        );
        console.log("✅ Gift Card Updated:", response.data);
        setSuccess("Gift card updated successfully!");
        setTimeout(() => onSubmit(response.data), 1500);
      } catch (err) {
        console.error("❌ Gift card update error:", err.response?.data || err);
        setError(extractError(err));
        setLoading(false);
      }

      // ── OTHER FORMS (users etc.) ─────────────────────────────────────
    } else {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData({});
    setCards([{ type: "Both", name: "", rate: "" }]);
    setStoreSearchTerm("");
    setSelectedStoreId(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const isCardForm = type === "create-card" || type === "edit-card";
  const isStoreForm = type === "create-store" || type === "edit-store";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            {config.title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-4">
          {/* ── GIFT CARD FORM (create-card & edit-card) ── */}
          {isCardForm ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type || ""}
                  onChange={handleChange("type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  <option value="Both">Both</option>
                  <option value="Physical">Physical</option>
                  <option value="E-code">E-code</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter gift card name"
                  value={formData.name || ""}
                  onChange={handleChange("name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate
                </label>
                <input
                  type="number"
                  placeholder="Enter rate"
                  step="0.01"
                  min="0"
                  value={formData.rate || ""}
                  onChange={handleChange("rate")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Searchable Store Select */}
              <div ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select a store..."
                    value={storeSearchTerm}
                    onChange={(e) => {
                      setStoreSearchTerm(e.target.value);
                      setShowStoreDropdown(true);
                      setSelectedStoreId(null);
                    }}
                    onFocus={() => setShowStoreDropdown(true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {showStoreDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredStores.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-center text-sm">
                          {giftCardStores.length === 0
                            ? "No stores available"
                            : "No stores found"}
                        </div>
                      ) : (
                        filteredStores.map((store) => (
                          <div
                            key={store.id}
                            onClick={() => selectStore(store.id, store.name)}
                            className={`px-4 py-3 cursor-pointer transition ${
                              selectedStoreId === store.id
                                ? "bg-purple-100 text-purple-900"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {store.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── ALL OTHER FORMS (create-store, edit-store, user forms) ── */
            <>
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      value={formData[field.name] || ""}
                      onChange={handleChange(field.name)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options &&
                        field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  ) : field.type === "file" ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {(imagePreview || formData.image) && (
                        <div className="mt-4 flex justify-center">
                          <img
                            src={imagePreview || formData.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-300 shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.label}
                      value={formData[field.name] || ""}
                      onChange={handleChange(field.name)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── GIFT CARDS SECTION (store forms only) ── */}
          {isStoreForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gift Cards
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-4">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={card.type}
                        onChange={(e) =>
                          handleCardChange(index, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="Both">Both</option>
                        <option value="Physical">Physical</option>
                        <option value="E-code">E-code</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Card name"
                        value={card.name}
                        onChange={(e) =>
                          handleCardChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate (₦)
                      </label>
                      <input
                        type="number"
                        placeholder="Rate"
                        step="0.01"
                        min="0"
                        value={card.rate}
                        onChange={(e) =>
                          handleCardChange(index, "rate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>

                    {cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCard(index)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 size={16} /> Remove Card
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCard}
                  className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add Another Card
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalComponent;

export function ConfirmationModal({
  isOpen,
  title,
  message,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-600",
          button: "bg-red-600 hover:bg-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
        };
      case "warning":
        return {
          icon: "text-yellow-600",
          button: "bg-yellow-600 hover:bg-yellow-700",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
        };
      case "info":
        return {
          icon: "text-blue-600",
          button: "bg-blue-600 hover:bg-blue-700",
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
        };
      default:
        return {
          icon: "text-gray-600",
          button: "bg-gray-600 hover:bg-gray-700",
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div
            className={`p-4 rounded-lg ${colors.bg} border ${colors.border} flex items-start gap-3`}
          >
            <AlertCircle
              size={20}
              className={`mt-0.5 flex-shrink-0 ${colors.icon}`}
            />
            <div>
              <p className={`font-medium ${colors.text}`}>{message}</p>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">Please confirm to proceed.</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${colors.button}`}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
