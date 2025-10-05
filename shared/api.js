/**
 * Shared API utilities and types
 */
import { API_CONFIG } from "./config";

// Get auth token from localStorage
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    // Primary key
    const primary = localStorage.getItem("auth_token");
    if (primary) return primary;
    // Backward compatibility: migrate legacy 'token' to 'auth_token'
    const legacy = localStorage.getItem("token");
    if (legacy) {
      try {
        localStorage.setItem("auth_token", legacy);
        localStorage.removeItem("token");
      } catch { }
      return legacy;
    }
  }
  return null;
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

// Common API headers
export const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// API request wrapper with error handling
export async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    console.log("=== apiRequest debug ===");
    console.log("Endpoint:", JSON.stringify(endpoint));
    console.log("Options:", JSON.stringify(options));

    // Validate endpoint
    if (!endpoint) {
      console.error("Invalid endpoint:", endpoint);
      return {
        success: false,
        error: "Invalid endpoint",
      };
    }

    // Ensure endpoint starts with /
    if (!endpoint.startsWith("/")) {
      console.log("Endpoint doesn't start with /, adding prefix");
      endpoint = "/" + endpoint;
    }

    const token = getAuthToken();
    console.log("Auth token:", token ? "present" : "not present");

    // Validate BASE_URL
    const baseUrl = API_CONFIG.BASE_URL;
    console.log("Base URL:", JSON.stringify(baseUrl));
    
    if (!baseUrl || baseUrl === "http://" || baseUrl === "https://") {
      console.error("Invalid API base URL:", JSON.stringify(baseUrl));
      return {
        success: false,
        error: "Invalid API configuration",
      };
    }

    // Ensure baseUrl doesn't end with / and doesn't have double slashes
    let cleanBaseUrl = baseUrl;
    if (cleanBaseUrl.endsWith("/")) {
      console.log("Base URL ends with /, removing");
      cleanBaseUrl = cleanBaseUrl.slice(0, -1);
    }

    // Ensure we have a valid URL construction
    if (!cleanBaseUrl || cleanBaseUrl.length === 0) {
      console.error("Invalid clean base URL:", JSON.stringify(cleanBaseUrl));
      return {
        success: false,
        error: "Invalid API base URL configuration",
      };
    }

    // Construct the full URL properly
    const fullUrl = `${cleanBaseUrl}${endpoint}`;
    console.log("Full URL:", JSON.stringify(fullUrl));

    // Validate the full URL
    try {
      const url = new URL(fullUrl);
      console.log("URL validation successful");
      console.log("Protocol:", url.protocol);
      console.log("Hostname:", url.hostname);
      console.log("Port:", url.port);
      console.log("Pathname:", url.pathname);
    } catch (urlError) {
      console.error("Invalid URL construction:", fullUrl, "Base:", cleanBaseUrl, "Endpoint:", endpoint);
      return {
        success: false,
        error: "Invalid URL construction: " + fullUrl,
      };
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...getAuthHeaders(token || undefined),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/signin";
        }
      }

      return {
        success: false,
        error: body.error || body.message || "An error occurred",
      };
    }

    // Unwrap common API shape { success, message, data }
    const unwrapped =
      body && typeof body === "object" && "data" in body ? body.data : body;

    return {
      success: true,
      data: unwrapped,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timeout",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Network error",
    };
  }
}

// Convenience methods for different HTTP methods
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: "GET" }),

  post: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, { method: "DELETE" }),

  patch: (endpoint, data) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
};