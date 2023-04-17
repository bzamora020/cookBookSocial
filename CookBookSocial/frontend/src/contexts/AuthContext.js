import { createContext, useContext, useState, useEffect } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import axios from "axios";

import { auth } from "../config/firebase";

const AuthContext = createContext();
const provider = new GoogleAuthProvider();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function register(email, password) {
        try {
            await createUserWithEmailAndPassword(auth, email, password)
                .then(function (user) {
                    axios
                        .post(`/api/user/${user.user.uid}`, {
                            email: user.user.email,
                        })
                        .then()
                        .catch(function (error) {
                            throw error;
                        });
                })
                .catch(function (error) {
                    throw error;
                });
            return;
        } catch (error) {
            throw error;
        }
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function updateUserProfile(user, profile) {
        return updateProfile(user, profile);
    }

    function loginWithGoogle() {
        return () =>
            signInWithPopup(auth, provider)
                .then((result) => {})
                .catch((error) => {
                    var errorCode = error.code;

                    if (errorCode === "auth/account-exists-with-different-credential") {
                        setError(
                            "You have already signed up with a different auth provider for that email."
                        );
                        // If you are using multiple auth providers on your app you should handle linking
                        // the user's accounts here.
                    } else {
                        console.error(error);
                    }
                });
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        register,
        error,
        setError,
        logout,
        updateUserProfile,
        loginWithGoogle,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
