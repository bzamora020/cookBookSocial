import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import styles from "./PasswordReset.module.css";
import { Link } from "react-router-dom";

const auth = getAuth();

function PasswordReset() {
    const [email, setEmail] = useState("");
    const [showBanner, setShowBanner] = useState(false);
    const [setCountdown] = useState(5);
    const [showError, setShowError] = useState(false);
    const [showButton, setShowButton] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowButton(false);
        try {
            await sendPasswordResetEmail(auth, email);
            setShowBanner(true);
            const interval = setInterval(
                () => setCountdown((prevCountdown) => prevCountdown - 1),
                1000
            );
            setTimeout(() => {
                clearInterval(interval);
                window.location.href = "/login";
            }, 5000);
        } catch (error) {
            console.error(error);
            if (error.code === "auth/user-not-found") {
                setShowError(`Email not found. Please check your email address and try again.`);
            } else if (error.code === "auth/too-many-requests") {
                setShowError(`Too many requests. Try again later.`);
            } else {
                setShowError(`Error sending email. Please try again later.`);
            }
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        setShowError(false);
        setShowButton(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles["form-box"]}>
                <h1>Password Reset</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={showBanner}
                    />
                    <br />
                    <br />
                    {showButton && <button type="submit">Submit</button>}
                </form>
                {showBanner && (
                    <div className={styles.banner}>
                        <p>Password reset email sent. Redirecting to login page.</p>
                        <div className={styles.spinner} />
                    </div>
                )}
                {showError && (
                    <div className={styles.error}>
                        <p>{showError}</p>
                    </div>
                )}
                <div className={styles["back-to-login"]}>
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default PasswordReset;
