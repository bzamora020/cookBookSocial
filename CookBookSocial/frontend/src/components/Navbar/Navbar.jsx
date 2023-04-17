import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "../Search/Search";
import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import styles from "./Navbars.module.css";

export default function Navbar() {
    const { currentUser, setError, logout } = useAuth();
    const [notifications, setNotifications] = useState(0);

    const navigate = useNavigate();

    const URL_GET_NOTIFICATIONS = `/api/user/notifications/${currentUser?.uid}`;
    useEffect(() => {
        fetch(URL_GET_NOTIFICATIONS, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data?.notifications.count);
                setNotifications(data?.notifications?.count);
            });
    }, []);

    async function handleLogout() {
        try {
            setError("");
            await logout();
            navigate("/login");
        } catch {
            setError("Failed to logout");
        }
    }

    const [profileVisible, setProfileVisible] = useState(false);
    const [navigationVisible, setNavigationVisible] = useState(false);

    function toggleDropdown(dropdownVisible, setDropdownVisible, setOtherDrowndown) {
        setDropdownVisible(!dropdownVisible);
        setOtherDrowndown(false);
    }

    return (
        <nav className="sticky top-0 z-50 bg-chef-orange border-gray-200 px-2 sm:px-4 md:py-4 py-2">
            <div className="container flex flex-wrap items-center justify-between mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex mr-6">
                        <img
                            src="https://svgsilh.com/svg/2400338.svg"
                            className="h-6 mr-2 sm:h-9"
                            alt="Cookbook Social"
                        />
                        <span className="self-center text-xl font-bold whitespace-nowra">
                            Cookbook Social
                        </span>
                    </Link>
                    <div
                        className={`items-center mr-3 justify-between w-full md:border-0 md:flex md:w-auto absolute md:static top-full left-0 bg-chef-orange md:z-0 z-40 ${
                            navigationVisible ? "block" : "hidden"
                        }`}
                        id="mobile-menu-2"
                    >
                        <ul className=" flex flex-col p-2 rounded-lg  md:flex-row md:space-x-6 md:mt-0 md:text-m md:font-medium md:border-0  ">
                            <li>
                                <Link
                                    to="/"
                                    className="block py-2 pl-3 pr-4 font-semibold md:text-gray-900 rounded md:bg-transparent md:p-0 hover:text-white hover:scale-110 transition ease-in-out duration-150"
                                    aria-current="page"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/new-post"
                                    className="block py-2 pl-3 pr-4 font-semibold text-gray-900 rounded md:p-0 hover:text-white hover:scale-110 transition ease-in-out duration-150"
                                >
                                    New Post
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/saved-post"
                                    className="block py-2 pl-3 pr-4 font-semibold text-gray-900 rounded md:p-0 hover:text-white hover:scale-110 transition ease-in-out duration-150"
                                >
                                    Saved Posts
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="border-l pl-4 border-gray-800 hidden md:block">
                        <SearchBar />
                    </div>
                </div>
                <div className="flex items-center md:order-2 relative">
                    <p className="font-semibold mr-2 hidden md:block md:text-gray-800 md:text-m">
                        Hello {currentUser.displayName}!
                    </p>
                    <button
                        type="button"
                        className="flex mr-3 text-sm bg-white rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300"
                        id="user-menu-button"
                        aria-expanded={profileVisible}
                        onClick={() =>
                            toggleDropdown(profileVisible, setProfileVisible, setNavigationVisible)
                        }
                    >
                        <span className="sr-only">Open user menu</span>
                        <img
                            className="md:w-10 md:h-10 h-8 w-8 rounded-full"
                            src={currentUser?.photoURL}
                            alt="user"
                        />
                    </button>
                    <div
                        className={`z-40 w-64 absolute right-0 mt-60 text-base text-left list-none bg-gray-100 border divide-y divide-gray-200 rounded-lg shadow-lg ${
                            profileVisible ? "block" : "hidden"
                        }`}
                        id="user-dropdown"
                    >
                        <div className="font-bold flex items-center px-4 py-3">
                            <img
                                className="w-8 h-8 mr-2 rounded-full bg-white shadow-lg"
                                src={currentUser?.photoURL}
                                alt="user"
                            />
                            <div>
                                <span className="block text-sm text-gray-90">
                                    {currentUser.displayName}
                                </span>
                                <span className="block text-sm font-medium text-gray-500 truncate">
                                    {currentUser.email}
                                </span>
                            </div>
                        </div>
                        <ul className="py-2" aria-labelledby="user-menu-button">
                            <li>
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Profile
                                </Link>

                                {notifications > 0 && (
                                    <span className={styles.navbarNotification}>
                                        {notifications}
                                    </span>
                                )}
                            </li>
                            <li>
                                <Link
                                    to="/edit-profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Edit Profile
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                    <button
                        data-collapse-toggle="mobile-menu-2"
                        type="button"
                        className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
                        aria-controls="mobile-menu-2"
                        aria-expanded="false"
                        onClick={() =>
                            toggleDropdown(
                                navigationVisible,
                                setNavigationVisible,
                                setProfileVisible
                            )
                        }
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg
                            className="w-6 h-6"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
