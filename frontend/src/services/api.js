import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://standard-pumps-quotation-system.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10-second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to format readable, uniform error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";
    let validationErrors = null;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 422) {
        // Pydantic request validation error
        message = "Input validation failed. Please check the entered data.";
        if (data.detail && Array.isArray(data.detail)) {
          // Parse validation errors to match field keys
          validationErrors = {};
          data.detail.forEach((err) => {
            const field = err.loc[err.loc.length - 1];
            validationErrors[field] = err.msg;
          });
        }
      } else if (status === 404) {
        message = data.detail || "Requested resource not found.";
      } else if (status === 500) {
        message = data.detail || "Server error. Please try again later.";
      } else {
        message = data.detail || `Server returned error status ${status}.`;
      }
    } else if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please check your network and try again.";
    } else if (error.request) {
      // Server offline / CORS failures
      message = "Could not connect to the quotation backend. Please verify the server is running.";
    }

    const formattedError = new Error(message);
    formattedError.status = error.response?.status;
    formattedError.validationErrors = validationErrors;
    
    return Promise.reject(formattedError);
  }
);

export default apiClient;
