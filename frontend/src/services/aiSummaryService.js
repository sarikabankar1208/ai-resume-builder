// src/services/aiSummaryService.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const generateSummary = async (payload) => {
  const response = await fetch(
    `${BASE_URL}/api/generate-summary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("AI generation failed");
  }

  return await response.json();
};

// ✅ ADD THIS NEW FUNCTION
export const enhanceJobDescription = async (payload) => {
  const response = await fetch(
    `${BASE_URL}/api/enhance-job-description`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Job description enhancement failed");
  }

  return await response.json();
};