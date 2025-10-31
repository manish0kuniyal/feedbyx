export async function fetchUser(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}api/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error("Auth check failed:", err);
    return null;
  }
}

export async function logoutUser(baseUrl) {
  try {
    await fetch(`${baseUrl}api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }
}
