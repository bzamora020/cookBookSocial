import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";

import { doc, getDoc } from "firebase/firestore";

import styles from "./Login.module.css";

export default function Login() {
  const { currentUser, login, setError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const userInfoRef = doc(db, "users", currentUser.uid);
      getDoc(userInfoRef)
        .then((snapshot) => {
          // If the user does not already have user data, we redirect them to the edit-profile
          if (!snapshot.exists()) {
            navigate("/edit-profile");
          } else {
            // Otherwise, their profile is good, so we send them to home
            navigate("/home");
          }
        })
        .catch((error) => console.log(error.message));
    }
  }, [currentUser, navigate]);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (e) {
      setError("Failed to login");
    }
    setLoading(false);
  };

  const GoogleRedirect = () => signInWithRedirect(auth, provider);

  return (
    <div className={styles.container}>
      <div className={styles.slider}>
        <div className={styles.slide}></div>
        <div className={styles.slide}></div>
        <div className={styles.slide}></div>
        <div className={styles.slide}></div>
        <div className={styles.slide}></div>
      </div>

      <div className={styles.rectangle}>
        <div className={styles.topText}>
          <h2>Login to your account</h2>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div>
            <div className={styles.inputFields}>
              <label htmlFor="email-address"> </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email Address"
                required
                className={styles.input}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputFields}>
              <label htmlFor="password"></label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                required
                className={styles.input}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputFields}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submit_button}
            >
              Login
            </button>
          </div>
        </form>
        {/* Note, this br tag adds space between the previous and next object */}
        <br />

        <div className={styles.inputFields}>
          <div className={styles.orText}>Or sign in with:</div>
          <button
            onClick={GoogleRedirect}
            disabled={loading}
            className={styles.googleButton}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google logo"
              className={styles.googleIcon}
            />
          </button>
        </div>
        <div className="flex items-center justify-between"></div>
        <div className="text-sm mt-2">
          <Link to="/password-reset" className="text-blue-600">
            Forgot Password?
          </Link>
        </div>

        <div className="text-sm mt-2">
          <Link to="/register" className="text-blue-600">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
