import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// TEMP DEBUG: log failing request details (remove after diagnosing)
api.interceptors.request.use((config) => {
  try {
    const url = `${config.baseURL || ""}${config.url || ""}`;
    console.log("[API request]", {
      method: config.method,
      url,
      baseURL: config.baseURL,
      path: config.url,
      withCredentials: config.withCredentials,
    });
  } catch {
    // ignore
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    try {
      console.log("[API response]", {
        url: `${res.config.baseURL || ""}${res.config.url || ""}`,
        status: res.status,
      });
    } catch (err) {
      // ignore
    }
    return res;
  },
  (error) => {
    console.log("[API error]", {
      message: error?.message,
      url:
        `${error?.config?.baseURL || ""}${error?.config?.url || ""}`,
      status: error?.response?.status,
      responseData: error?.response?.data,
    });
    return Promise.reject(error);
  },
);


export async function register({ username, email, password }) {
  const response = await api.post("/api/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function logout() {
  const response = await api.get("/api/auth/logout");

  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");

  return response.data;
}

