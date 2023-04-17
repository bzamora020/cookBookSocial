import "./App.css";

import React from "react";

import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Signup from "./pages/SignupPage/Signup";
import Login from "./pages/LoginPage/Login";
import EditPost from "./pages/EditPostPage/EditPost";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";
import ProfilePic from "./pages/ProfilePicPage/ProfilePic";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import WithPrivateRoute from "./utils/WithPrivateRoute";
import SavedPage from "./pages/SavedPage/SavedPage";
import PasswordReset from "./pages/PasswordReset/PasswordReset";
import PeoplePage from "./pages/PeoplePage/PeoplePage";
import RecipePage from "./pages/RecipePage/RecipePage";
import InvalidURL from "./pages/Invalid URL/InvalidURL";
import NewPost from "./pages/NewPostPage/NewPost";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
    const queryClient = new QueryClient();
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <div className="App">
                    <ErrorMessage />
                    <Routes>
                        <Route exact path="/login" element={<Login />} />

                        <Route
                            exact
                            path="/home"
                            element={
                                <WithPrivateRoute>
                                    <HomePage />
                                </WithPrivateRoute>
                            }
                        />

                        <Route exact path="/register" element={<Signup />} />
                        <Route exact path="/Invalid" element={<InvalidURL />} />
                        <Route exact path="/password-reset" element={<PasswordReset />} />
                        <Route
                            exact
                            path="/profile"
                            element={
                                // This adds private routing
                                <WithPrivateRoute>
                                    <ProfilePage />
                                </WithPrivateRoute>
                            }
                        />
                        <Route exact path="/new-post" element={<NewPost />} />
                        <Route
                            exact
                            path="/profile/:userId"
                            element={
                                // This adds private routing
                                <WithPrivateRoute>
                                    <PeoplePage />
                                </WithPrivateRoute>
                            }
                        />
                        <Route exact path="/edit-profile" element={<ProfilePic />} />

                        <Route
                            exact
                            path="/saved-post"
                            element={
                                <WithPrivateRoute>
                                    <SavedPage />
                                </WithPrivateRoute>
                            }
                        />

                        <Route exact path="/edit-recipe/:id" element={<EditPost />} />
                        {/* Add the dynamic recipe page route */}
                        <Route path="/recipe/:id" element={<RecipePage />} />

                        {/* This route is a "wilcard", if someone tries to access a non defined route, they will be redirected to home route */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </div>
            </QueryClientProvider>
        </AuthProvider>
    );
}

export default App;
