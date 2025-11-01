export async function sendChatQuery(baseUrl, formId, query) {
  try {
    const res = await fetch(`${baseUrl}api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, query }),
    });
    if (!res.ok) throw new Error("Chat query failed");
    const data = await res.json();
    return data.answer;
  } catch (err) {
    console.error("Chat API error:", err);
    throw err;
  }
}
