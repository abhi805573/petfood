import Axios from "axios";

// ✅ CRA / Webpack version
const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const axiosInstance = Axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response) {
      const token = localStorage.getItem("jwt_token");

      if (error.response.status === 401 && token) {

        localStorage.removeItem("jwt_token");
        localStorage.removeItem("userID");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance as axios };