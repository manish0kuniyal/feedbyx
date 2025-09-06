import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function GoogleSignInButton() {
  const navigate = useNavigate();

  const handleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) throw new Error("No credential token received");

      // Send token to backend and set cookie
      await axios.post(
        "http://localhost:5000/api/auth/google/token",
        { token },
        { withCredentials: true }
      );

      // Fetch current user to confirm login
      const meRes = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true,
      });

      if (meRes.data.user) {
        // User exists → redirect to dashboard
        navigate("/dashboard");
      } else {
        console.error("User not authenticated yet");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
return (
  <GoogleLogin
    onSuccess={handleLogin}
    onError={() => console.log("Login Failed")}
    prompt="select_account" // ✅ forces account selection
  />
);

}
