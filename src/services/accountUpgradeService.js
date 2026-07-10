import axiosInstance from "./api/axiosConfig";

const logError = (label, err) => {
  console.error(`❌ ${label} error:`, err.response?.data ?? err.message);
  throw err;
};

const accountUpgradeService = {
  getPendingLevel2Requests: () =>
    axiosInstance
      .get("/admin/pending/level2/")
      .catch((err) => logError("getPendingLevel2Requests", err)),

  getPendingLevel3Requests: () =>
    axiosInstance
      .get("/admin/pending/level3/")
      .catch((err) => logError("getPendingLevel3Requests", err)),

  approveLevel2: (credentialId) =>
    axiosInstance
      .post(`/admin/approve/level2/${credentialId}/`, { action: "approve" })
      .catch((err) => logError("approveLevel2", err)),

  approveLevel3: (credentialId) =>
    axiosInstance
      .post(`/admin/approve/level3/${credentialId}/`, { action: "approve" })
      .catch((err) => logError("approveLevel3", err)),

  rejectLevel2: (credentialId) =>
    axiosInstance
      .post(`/admin/reject/level2/${credentialId}/`, { action: "reject" })
      .catch((err) => logError("rejectLevel2", err)),

  rejectLevel3: (credentialId) =>
    axiosInstance
      .post(`/admin/reject/level3/${credentialId}/`, { action: "reject" })
      .catch((err) => logError("rejectLevel3", err)),
};

export default accountUpgradeService;
