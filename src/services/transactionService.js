import axiosInstance from "./api/axiosConfig";

const transactionService = {
  // Get all transactions
  getAllTransactions: () => {
    return axiosInstance.get("/admin/transactions/");
  },

  // Update the status of a transaction (Pending | Approved | Rejected)
  // Payload: { status: string, admin_notes?: string }
  updateTransactionStatus: (transactionId, payload) => {
    return axiosInstance.patch(
      `/admin/update-transactions-status/${transactionId}/`,
      payload,
    );
  },
};

export default transactionService;
