
export async function createForm(baseUrl, formData) {
  try {
    const res = await fetch(`${baseUrl}api/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to create form:", err);
    throw err;
  }
}



export async function fetchForms(baseUrl, uid) {
  if (!uid) return [];
  try {
    const res = await fetch(`${baseUrl}api/forms?uid=${uid}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.forms || [];
  } catch (err) {
    console.error("Failed to fetch forms:", err);
    return [];
  }
}


export async function patchForm(baseUrl, id, payload) {
  const url = `${baseUrl}api/forms/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || `PATCH failed (${res.status})`);
  }
  return await res.json();
}


export async function deleteForm(baseUrl, id) {
  const url = `${baseUrl}api/forms/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`DELETE failed (${res.status})`);
  return true;
}

export async function fetchFormById(baseUrl, formId) {
  try {
    const res = await fetch(`${baseUrl}api/forms/${formId}`);
    if (!res.ok) throw new Error("Form not found");
    return await res.json();
  } catch (err) {
    console.error("Error fetching form:", err);
    throw err;
  }
}