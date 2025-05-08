import { getAuth } from "firebase/auth";

const API_BASE_URL = "http://localhost:8080";

/**
 * Sends Firebase token to your backend with automatic GET/POST support.
 * @param {string} endpoint - API endpoint (e.g., "api/auth/me")
 * @param {Object} [additionalData] - Optional body payload (triggers POST)
 * @returns {Promise<Object>} Parsed JSON response
 */
export const sendTokenToBackend = async (endpoint, additionalData = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found");
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const token = await user.getIdToken(true);
  console.debug("🔐 Obtained Firebase ID token");

  const method = Object.keys(additionalData).length > 0 ? "POST" : "GET";
  const fetchOptions = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`
    }
  };

  if (method === "POST") {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(additionalData);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, fetchOptions);

    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error("❌ Backend request failed:", {
        status: response.status,
        error: errorData
      });
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("❌ Failed to communicate with backend:", error);
    throw error;
  }
};

/**
 * Safely parse the backend response
 */
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    const text = await response.text();
    return { message: text };
  } catch (parseError) {
    console.error("❌ Failed to parse response:", parseError);
    return {
      message: `Failed to parse response (status ${response.status})`
    };
  }
};
