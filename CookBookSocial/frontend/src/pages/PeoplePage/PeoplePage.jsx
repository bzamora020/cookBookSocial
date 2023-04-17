import React, { useEffect, useState } from "react";
import MiniRecipePost from "../../components/MiniRecipePosts/MiniRecipePost";
import Navbar from "../../components/Navbar/Navbar";
import "./PeoplePage.css";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import AddFriendButton from "../../components/Friends/addFriendButton/AddFriendButton";
import { Redirect } from "react-router-dom";

function PeoplePage() {
    const [profileRecipePostsList, updateProfileRecipePostsList] = useState([]);
    const [profileInfo, updateProfileInfo] = useState([]);
    //uses param from route :userId
    const { userId } = useParams();

    const { currentUser } = useAuth();
    const POSTS_AT_A_TIME = 6;
    const [numPosts, setNumPosts] = useState(POSTS_AT_A_TIME);

    //useAuth has information from Firebase about user, we will get email from here
    /*
  This will fetch the list of PROFILE recipe posts stored in the database 
  as an array of json objects. It will then save it in the state variable profileRecipePostsList.
  It will refresh and check for new posts everytime the page refreshes.
  "URL_GET_PROFILE_RECIPE_POSTS_DATA" will be replaced by the actual api endpoint for GET once it is created by
  the backend.
  */
    const URL_GET_PROFILE_RECIPE_POSTS_DATA = "/api/recipe/all";

    useEffect(() => {
        fetch(URL_GET_PROFILE_RECIPE_POSTS_DATA)
            .then((response) => response.json())
            .then((data) => updateProfileRecipePostsList(data));
    }, []);

    //get profile info
    useEffect(() => {
        getProfileInfo();
    }, []);
    useEffect(() => {}, [profileInfo]);

    useEffect(() => {
        if (userId === currentUser.uid) {
            window.location.href = "/profile";
        }
    });

    //get user's data from firestore doc identified with their userID
    function getProfileInfo() {
        const userInfoRef = doc(db, "users", userId);

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
        let profilePostCount = 0; //count number of profile posts rendered, and keep under numPosts
        for (let i = 0; i < profileRecipePostsList.length && profilePostCount < numPosts; i++) {
            if (profileRecipePostsList[i].uid === userId) {
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
    return (
        <div>
            <Navbar />
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-gray-100 h-32 w-32 rounded">
                    <img
                        src={profileInfo.data?.profile ? profileInfo.data?.profile.photoURL : null}
                        className=""
                        alt="No-Pic"
                    />
                </div>
                <div className="mt-2 text-xl text-left font-bold">
                    {profileInfo.data?.profile
                        ? profileInfo.data?.profile.displayName
                        : "No username"}
                </div>
                <div className="text-xl text-gray-600 text-left ">{profileInfo.data?.email}</div>
                <ul>
                    <div className="text-m text-gray-600 text-left whitespace-pre-line">
                        {profileInfo.data?.profile
                            ? profileInfo.data?.profile?.biography
                                ? profileInfo.data?.profile?.biography
                                : "No Bio"
                            : "No Bio"}
                    </div>
                    <li className="friend-button">
                        <AddFriendButton
                            currentUserId={currentUser.uid}
                            profileUid={userId}
                            profileInfo={profileInfo.data}
                        />
                    </li>
                </ul>
            </div>
            <div className="profile-page">
                <ul className="grid grid-cols-3 gap-x-2 gap-y-0.5px">{renderProfileRecipePostComponents()}</ul>
            </div>
        </div>
    );
}

export default PeoplePage;
