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
    } catch {
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


/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("resumeDescription", selfDescription);
  formData.append("selfDescription", selfDescription);
  if (resumeFile) {
    formData.append("single", resumeFile);
  }

  const response = await api.post("/api/interview/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
  const response = await api.get(`/api/interview/report/${interviewId}`);

  return { interviewReport: response.data };
};

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview/");

  return { interviewReports: response.data };
};

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */

export const generateResumePdf = async ({ interviewReportId }) => {
  const response = await api.post(
    `/api/interview/resume/pdf/${interviewReportId}`,
    null,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  return response.data;
};
