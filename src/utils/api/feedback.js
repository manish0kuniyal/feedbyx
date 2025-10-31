export async function fetchFeedbacks(baseUrl, uid) {
  if (!uid) return {};
  try {
    const res = await fetch(`${baseUrl}api/feedback?uid=${uid}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.feedbacksByForm || {};
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    return {};
  }
}


export async function fetchFeedbacksByUser(baseUrl, uid, signal) {
  if (!uid) return {};
  try {
    const res = await fetch(`${baseUrl}api/feedback?uid=${uid}`, { signal });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.feedbacksByForm || {};
  } catch (err) {
    if (err.name === "AbortError") return {};
    console.error("Error fetching feedbacks:", err);
    return {};
  }
}

export async function searchFeedbacks(baseUrl, query) {
  if (!query) return [];
  try {
    const res = await fetch(`${baseUrl}api/feedback?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const allRaw = Object.values(data.feedbacksByForm || {}).flat();
    return allRaw;
  } catch (err) {
    console.error("Error searching feedbacks:", err);
    return [];
  }
}


// utils/api/feedback.js

export async function submitFeedback(baseUrl, payload) {
  try {
    const res = await fetch(`${baseUrl}api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(text || "Submission failed");
    }
    return await res.json();
  } catch (err) {
    console.error("Error submitting feedback:", err);
    throw err;
  }
}
