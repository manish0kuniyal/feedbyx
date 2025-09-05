// client/src/components/GoogleSignInButton.jsx
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleSignInButton({ onLogin }) {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const token = credentialResponse.credential; // JWT token from Google
          
          // Send token to backend to verify / create user
          const res = await axios.post(
            "http://localhost:5000/api/auth/google/token",
            { token },
            { withCredentials: true } // so backend can set cookie
          );

          onLogin(res.data.user); // update frontend state
        } catch (err) {
          console.error(err);
        }
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
