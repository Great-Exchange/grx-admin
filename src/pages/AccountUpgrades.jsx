import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

function AccountUpgrades() {
  const {
    level2Requests,
    level3Requests,
    loading,
    handleApproveUpgrade,
    handleRejectUpgrade,
  } = useOutletContext();

  const [expandedRequest, setExpandedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("level2");

  // Tracks which request is currently being approved or rejected
  // { id, action: 'approve' | 'reject' }
  const [processing, setProcessing] = useState(null);

  // Confirmation state — shown inline before committing the action
  // { id, action: 'approve' | 'reject', level }
  const [pendingConfirm, setPendingConfirm] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader
            size={40}
            className="text-purple-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Loading upgrade requests...</p>
        </div>
      </div>
    );
  }

  const requests = activeTab === "level2" ? level2Requests : level3Requests;
  const levelNumber = activeTab === "level2" ? 2 : 3;

  // ── Tabs (always shown) ──────────────────────────────────────────
  const Tabs = () => (
    <div className="flex gap-2 border-b border-gray-200">
      <button
        onClick={() => {
          setActiveTab("level2");
          setExpandedRequest(null);
          setPendingConfirm(null);
        }}
        className={`px-4 py-3 font-medium transition ${
          activeTab === "level2"
            ? "border-b-2 border-purple-600 text-purple-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Level 2 Upgrades ({level2Requests?.length || 0})
      </button>
      <button
        onClick={() => {
          setActiveTab("level3");
          setExpandedRequest(null);
          setPendingConfirm(null);
        }}
        className={`px-4 py-3 font-medium transition ${
          activeTab === "level3"
            ? "border-b-2 border-purple-600 text-purple-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Level 3 Upgrades ({level3Requests?.length || 0})
      </button>
    </div>
  );

  // ── Confirm and execute action ───────────────────────────────────
  const handleConfirmedAction = async () => {
    if (!pendingConfirm) return;
    const { id, action, level } = pendingConfirm;
    setProcessing({ id, action });
    setPendingConfirm(null);
    try {
      if (action === "approve") {
        await handleApproveUpgrade(id, level);
      } else {
        await handleRejectUpgrade(id, level);
      }
    } finally {
      setProcessing(null);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────
  if (!requests || requests.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Account Upgrade Requests
        </h3>
        <Tabs />
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            No pending Level {levelNumber} upgrade requests
          </p>
          <p className="text-gray-400 text-sm mt-1">All caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h3 className="text-2xl font-bold text-gray-900">
        Account Upgrade Requests
      </h3>

      <Tabs />

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => {
          const isExpanded = expandedRequest === request.id;
          const isProcessing = processing?.id === request.id;

          return (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* ── Request Header (always visible) ─────────────── */}
              <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedRequest(isExpanded ? null : request.id)
                }
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Expand icon */}
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {request.user?.full_name ||
                        request.user?.email ||
                        "Unknown user"}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {request.user?.email && (
                        <span className="mr-2">{request.user.email} •</span>
                      )}
                      Level {levelNumber} Upgrade Request • ID #{request.id}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      request.status?.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status ||
                      (request.approved ? "Approved" : "Rejected")}
                  </span>
                </div>
              </div>

              {/* ── Expanded Details ─────────────────────────────── */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                  {/* Level 2: NIN + image */}
                  {levelNumber === 2 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Identity Verification (NIN)
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            NIN Number
                          </p>
                          <p className="font-mono font-semibold text-gray-900 text-lg tracking-widest">
                            {request.nin || "—"}
                          </p>
                        </div>
                        {request.nin_image && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">
                              NIN Image
                            </p>
                            <img
                              src={request.nin_image}
                              alt="NIN"
                              className="max-w-sm w-full h-auto rounded-lg border border-gray-300 shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Level 3: address + images */}
                  {levelNumber === 3 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Address & Verification
                      </h4>

                      {/* Address fields */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              House Address 1
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.house_address_1 || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              House Address 2
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.house_address_2 || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Nearest Bus Stop
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.nearest_bus_stop || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">City</p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.city || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">State</p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.state || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Country
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {request.country || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Verification images */}
                      {(request.proof_of_address_image ||
                        request.face_verification_image) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {request.proof_of_address_image && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-2">
                                Proof of Address
                              </p>
                              <img
                                src={request.proof_of_address_image}
                                alt="Proof of Address"
                                className="w-full h-auto rounded border border-gray-200"
                              />
                            </div>
                          )}
                          {request.face_verification_image && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <p className="text-xs text-gray-500 mb-2">
                                Face Verification
                              </p>
                              <img
                                src={request.face_verification_image}
                                alt="Face Verification"
                                className="w-full h-auto rounded border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Inline confirmation prompt ─────────────────── */}
                  {pendingConfirm?.id === request.id ? (
                    <div
                      className={`rounded-lg p-4 border ${
                        pendingConfirm.action === "approve"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <p
                        className={`font-medium mb-3 ${
                          pendingConfirm.action === "approve"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {pendingConfirm.action === "approve"
                          ? `Approve this Level ${levelNumber} upgrade request?`
                          : `Reject this Level ${levelNumber} upgrade request?`}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleConfirmedAction}
                          className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                            pendingConfirm.action === "approve"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {pendingConfirm.action === "approve" ? (
                            <>
                              <CheckCircle size={15} /> Yes, Approve
                            </>
                          ) : (
                            <>
                              <XCircle size={15} /> Yes, Reject
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setPendingConfirm(null)}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Action Buttons ──────────────────────────── */
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setPendingConfirm({
                            id: request.id,
                            action: "approve",
                            level: levelNumber,
                          })
                        }
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && processing.action === "approve" ? (
                          <>
                            <Loader size={15} className="animate-spin" />{" "}
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={15} /> Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          setPendingConfirm({
                            id: request.id,
                            action: "reject",
                            level: levelNumber,
                          })
                        }
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing && processing.action === "reject" ? (
                          <>
                            <Loader size={15} className="animate-spin" />{" "}
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle size={15} /> Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AccountUpgrades;
