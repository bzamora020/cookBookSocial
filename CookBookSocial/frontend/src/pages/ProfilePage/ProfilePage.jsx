import React, { useEffect, useState } from "react";
import MiniRecipePost from "../../components/MiniRecipePosts/MiniRecipePost";
import Navbar from "../../components/Navbar/Navbar";
import "./ProfilePage.css";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import FriendRequestsDisplay from "../../components/Friends/friendRequestsDisplay/FriendRequestsDisplay";
import FriendsListModal from "../../components/Friends/FriendsList/FriendsListModal";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const [profileRecipePostsList, updateProfileRecipePostsList] = useState([]);
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileInfo, updateProfileInfo] = useState([]);
    const POSTS_AT_A_TIME = 6;
    const [numPosts, setNumPosts] = useState(POSTS_AT_A_TIME);
    const navigate = useNavigate();

    function handleOpenModal() {
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    let username = "No Username Found";

    if ("displayName" in currentUser) {
        username = currentUser.displayName;
    } else if ("email" in currentUser) {
        username = currentUser.email;
    }

    //useAuth has information from Firebase about user, we will get userId from here
    /*
  This will fetch the list of PROFILE recipe posts stored in the database 
  as an array of json objects. It will then save it in the state variable profileRecipePostsList.
  It will refresh and check for new posts everytime the page refreshes.
  "URL_GET_PROFILE_RECIPE_POSTS_DATA" will be replaced by the actual api endpoint for GET once it is created by
  the backend.
  */

//   Make a sidebar to display the notifications ********



    const URL_GET_PROFILE_RECIPE_POSTS_DATA = "/api/recipe/all";
    const URL_RESET_NOTIFICATIONS = `/api/user/notifications/${currentUser.uid}`

    useEffect(() => {
        fetch(URL_GET_PROFILE_RECIPE_POSTS_DATA)
            .then((response) => response.json())
            .then((data) => updateProfileRecipePostsList(data));

        fetch(URL_RESET_NOTIFICATIONS, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json'
            }
        });
        
        
    }, []);
    //get profile info
    useEffect(() => {
        if (currentUser) {
            // If the user does not already have user data, we redirect them to the edit-profile
            if (!currentUser.displayName) {
              navigate("/edit-profile");
            }
              
          }
        getProfileInfo();
    }, []);
    useEffect(() => {}, [profileInfo]);

    //get user's data from firestore doc identified with their userID
    function getProfileInfo() {
        const userInfoRef = doc(db, "users", currentUser.uid);

        getDoc(userInfoRef)
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("invalid user");
                    window.location.href = "/Invalid";
                }
                const profileInfData = {
                    data: snapshot.data(),
                    id: snapshot.id,
                };
                updateProfileInfo(profileInfData);
            })
            .catch((error) => console.log(error.message));
    }

    function renderProfileRecipePostComponents() {
        const arrComponents = [];
        let profilePostCount = 0; //count number of profile posts rendered, and keep less than numPosts
        for (let i = 0; i < profileRecipePostsList.length && profilePostCount < numPosts; i++) {
            if (profileRecipePostsList[i].uid === currentUser.uid) {
                arrComponents.push(<MiniRecipePost key={i} recipe={profileRecipePostsList[i]} />);
                profilePostCount += 1;
            }
        }
        if (arrComponents.size === 0) {
            return (
                <h1 style={{ color: "blue", fontSize: "60px" }}>You currently do not have posts</h1>
            );
        } else {
            return arrComponents;
        }
    }
    const scrollCheck = () => {
        const scrollTop = document.documentElement.scrollTop; //amount scrolled from the top
        const scrollHeight = document.documentElement.scrollHeight; //total height of rendered
        const clientHeight = document.documentElement.clientHeight; //height of the window we see

        if (scrollTop + clientHeight >= scrollHeight && numPosts <= profileRecipePostsList.length) {
            //if we are at bottom, and there are more recipes, update number of recipes to show
            setNumPosts(numPosts + POSTS_AT_A_TIME);
        }
    };
    useEffect(() => {
        //when scrolling, call function to check if need to update number of posts
        document.addEventListener("scroll", scrollCheck);
        return () => document.removeEventListener("scroll", scrollCheck);
    });

    //have user info at top
    return (
        <div>
            <Navbar />
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-gray-100 h-32 w-32 rounded">
                    <img src={currentUser?.photoURL} className="" alt="No-Pic" />
                </div>

                <div className="mt-2 text-xl text-left font-bold">
                    {username ? username : "No username"}
                </div>
                <div className="text-xl text-gray-600 text-left ">{currentUser.email}</div>
                <div className="text-m text-gray-600 text-left whitespace-pre-line mb-2">
                    {profileInfo.data?.profile
                        ? profileInfo.data?.profile?.biography
                            ? profileInfo.data?.profile?.biography
                            : "No Bio"
                        : "No Bio"}
                </div>
                <button
                    onClick={handleOpenModal}
                    style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                    }}
                >
                    View Friends List
                </button>

                <FriendsListModal isOpen={isModalOpen} onRequestClose={handleCloseModal} />
                <FriendRequestsDisplay currentUserId={currentUser.uid} />
                <h2 className="mt-4 text-left text-xl font-bold">Recent posts</h2>
                <div className="profile-page">
                    <ul className="grid grid-cols-3 gap-x-2 gap-y-0.5px">{renderProfileRecipePostComponents()}</ul>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
