const BASE_URL = import.meta.env.VITE_BASE_URL;

/* -------- GET CURRENT USER -------- */
export async function fetchUser() {
  try {
    const res = await fetch(`${BASE_URL}api/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error("Auth check failed:", err);
    return null;
  }
}

/* -------- SIGNUP -------- */
export async function signupUser({ name, email, password }) {
  const res = await fetch(`${BASE_URL}api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error("Signup failed");

  return await fetchUser();
}

/* -------- LOGIN -------- */
export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  return await fetchUser();
}

/* -------- GOOGLE LOGIN -------- */
export async function googleLogin(token) {
  const res = await fetch(`${BASE_URL}api/auth/google/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  if (!res.ok) throw new Error("Google login failed");

  return await fetchUser();
}

/* -------- LOGOUT -------- */
export async function logoutUser() {
  await fetch(`${BASE_URL}api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}