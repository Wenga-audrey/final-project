// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3002",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
      LOGOUT: "/api/auth/logout",
      REFRESH: "/api/auth/refresh",
      FORGOT_PASSWORD: "/api/auth/forgot-password",
      RESET_PASSWORD: "/api/auth/reset-password",
    },
    USERS: {
      PROFILE: "/api/profile",
      UPDATE_PROFILE: "/api/profile",
    },
    // Updated to use prep-classes instead of courses
    PREP_CLASSES: {
      LIST: "/api/prep-classes",
      DETAIL: (id) => `/api/prep-classes/${id}`,
      ENROLL: (id) => `/api/prep-classes/${id}/enroll`,
    },
    // Updated to use subjects instead of courses
    SUBJECTS: {
      DETAIL: (id) => `/api/subjects/subject/${id}`,
      CREATE: "/api/subjects",
      ASSIGN_TEACHER: (subjectId) => `/api/subjects/${subjectId}/assign-teacher`,
      REMOVE_TEACHER: (subjectId, teacherId) => `/api/subjects/${subjectId}/remove-teacher/${teacherId}`,
      GET_TEACHERS: (subjectId) => `/api/subjects/${subjectId}/teachers`
    },
    ASSESSMENTS: {
      DETAIL: (id) => `/api/assessments/${id}`,
      SUBMIT: (id) => `/api/assessments/${id}/submit`,
      ADAPTIVE_GENERATE: "/api/assessments/adaptive/generate",
    },
    // Updated to use ai instead of learning-paths
    AI: {
      GENERATE_CONTENT: "/api/ai/generate-content",
      GENERATE_QUIZ: "/api/ai/generate-quiz",
      RECOMMENDATIONS: "/api/ai/recommendations"
    },
    // Updated to use forums instead of analytics
    FORUMS: {
      STUDY_GROUPS: "/api/forums/study-groups",
      STUDY_GROUP_DETAIL: (id) => `/api/forums/study-groups/${id}`,
      JOIN_STUDY_GROUP: (id) => `/api/forums/study-groups/${id}/join`,
    },
    // Updated to use learner instead of analytics
    LEARNER: {
      DASHBOARD: "/api/learner/dashboard",
      CONTEXT: "/api/learner/context",
      RECENT_QUIZ_RESULTS: "/api/learner/recent-quiz-results",
    },
    // Updated to use instructor instead of admin
    INSTRUCTOR: {
      UPLOAD_CONTENT: (subjectId) => `/api/instructor/subjects/${subjectId}/content`,
    },
    // Updated to use prep-admin instead of admin
    PREP_ADMIN: {
      DASHBOARD: "/api/prep-admin/dashboard",
      CLASSES: "/api/prep-admin/classes",
      CREATE_CLASS: "/api/prep-admin/classes",
      ASSIGN_TEACHER: (classId, subjectId) => `/api/prep-admin/classes/${classId}/subjects/${subjectId}/assign-teacher`,
      VALIDATE_ENROLLMENT: (enrollmentId) => `/api/prep-admin/enrollments/${enrollmentId}/validate`,
    },
    // Updated to use super-admin instead of admin
    SUPER_ADMIN: {
      DASHBOARD: "/api/super-admin/dashboard",
      BACKUPS: "/api/super-admin/backups",
      SECURITY: "/api/super-admin/security",
    },
  },
};

// Debug logging
console.log("API_CONFIG.BASE_URL from environment:", import.meta.env.VITE_API_URL);
console.log("API_CONFIG.BASE_URL final value:", API_CONFIG.BASE_URL);
console.log("Type of BASE_URL:", typeof API_CONFIG.BASE_URL);

// Add comprehensive validation to ensure BASE_URL is properly formatted
const rawBaseUrl = import.meta.env.VITE_API_URL;
console.log("Raw BASE_URL from env:", JSON.stringify(rawBaseUrl));

if (rawBaseUrl === undefined || rawBaseUrl === null || rawBaseUrl === "") {
  console.warn("VITE_API_URL is undefined/null/empty, using default localhost:3002");
  API_CONFIG.BASE_URL = "http://localhost:3002";
} else if (rawBaseUrl === "http://" || rawBaseUrl === "https://") {
  console.warn("VITE_API_URL is invalid (just protocol), using default localhost:3002");
  API_CONFIG.BASE_URL = "http://localhost:3002";
} else {
  API_CONFIG.BASE_URL = rawBaseUrl;
}

console.log("API_CONFIG.BASE_URL after validation:", API_CONFIG.BASE_URL);

// Additional validation to ensure BASE_URL is a valid URL
try {
  const url = new URL(API_CONFIG.BASE_URL);
  console.log("API_CONFIG.BASE_URL is valid");
  console.log("Protocol:", url.protocol);
  console.log("Hostname:", url.hostname);
  console.log("Port:", url.port);
} catch (error) {
  console.error("API_CONFIG.BASE_URL is invalid:", API_CONFIG.BASE_URL, error.message);
  // Fallback to default
  API_CONFIG.BASE_URL = "http://localhost:3002";
  console.log("Using fallback BASE_URL:", API_CONFIG.BASE_URL);
}

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Default headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};