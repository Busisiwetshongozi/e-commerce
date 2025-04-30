import { getAuth } from "firebase/auth";

const API_BASE_URL = "http://localhost:8080"; // Base URL

/**
 * Sends Firebase token to your protected backend endpoint
 * @param {string} endpoint - API endpoint path (e.g., "api/protected/user-info")
 * @param {Object} [additionalData] - Optional additional data to send
 * @returns {Promise<Object>} Parsed JSON response from backend
 */
export const sendTokenToBackend = async (endpoint, additionalData = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found");
  }

  // Normalize endpoint path
  const normalizedEndpoint = endpoint.startsWith("/") 
    ? endpoint 
    : `/${endpoint}`;

  try {
    // Get fresh ID token
    const token = await user.getIdToken(true);
    console.debug("Obtained Firebase ID token");

    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: Object.keys(additionalData).length > 0 
        ? JSON.stringify(additionalData) 
        : undefined
    });

    // Handle response
    if (!response.ok) {
      const errorData = await parseResponse(response);
      console.error("Backend request failed:", {
        status: response.status,
        error: errorData
      });
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Failed to communicate with backend:", error);
    throw error;
  }
};

/**
 * Helper function to parse response body
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
    console.error("Failed to parse response:", parseError);
    return { 
      message: `Failed to parse response (status ${response.status})` 
    };
  }
};