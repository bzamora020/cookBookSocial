import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { renderIngredients } from "./functions/RecipePostFunctions";
import { useAuth } from "../../contexts/AuthContext";
import commentIcon from "../../images/commentIcon.png";

import addCommentIcon from "../../images/sendComment.png";

import likeIcon from "../../images/likeIcon.png";

import { BsHeart, BsHeartFill, BsBookmark, BsFillBookmarkFill, BsBrush } from "react-icons/bs";
import LikeListModal from "../LikeList/LikeList.jsx";
import axios from "axios";

import "./RecipePost.css";
import { IconContext } from "react-icons/lib";

/*
What does calling useState do? It declares a “state variable”. Our variable is called response but we could call it anything else, like banana. This is a way to “preserve” some values between the function calls. Normally, variables “disappear” when the function exits but state variables are preserved by React.
*/

function RecipePost({ recipe, isSavedPage, deleteinSavedPage }) {
    const [showFullRecipe, toggleShowFullRecipe] = useState(false);
    const [editPostPath, setEditPostPath] = useState(`/edit-recipe/${recipe.id}`);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [numLikes, updateNumLikes] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    const [isLikedAnimation, setIsLikedAnimation] = useState(false);

    const { currentUser } = useAuth();

    const Recipe_URL = `/api/recipe/${recipe.id}`;
    /*
    useEffect(() => {
        updateNumLikes(recipe.likesByUid.length);
    }, [])
    */

    useEffect(() => {
        //get isSaved
        const URL_CHECK_SAVED_POST = `/api/recipe/checkSavedPost/${recipe.id}/${currentUser.uid}`;
        fetch(URL_CHECK_SAVED_POST)
            .then((response) => response.json())
            .then((data) => {
                setIsSaved(data);
            })
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        //get isLiked
        const URL_CHECK_LIKED_POST = `/api/recipe/checkLikedPost/${recipe.id}/${currentUser.uid}`;
        fetch(URL_CHECK_LIKED_POST)
            .then((response) => response.json())
            .then((data) => {
                setIsLiked(data);
            })
            .catch((error) => console.log(error));
    }, []);

    async function toggleLiked() {
        setIsLikedAnimation(!isLikedAnimation);
        let newLikesByUid = [...recipe.likesByUid];
        if (isLiked) {
            //remove current user.id from recipe list of users who liked the post
            for (let i = 0; i < newLikesByUid.length; i++) {
                if (currentUser.uid === newLikesByUid[i]) {
                    //UPDATE the array of uid's of the recipe post
                    newLikesByUid.splice(i, 1);
                }
            }
        } else {
            //add current user.id to recipe list of users who liked the post
            //UPDATE the array of uid's of the recipe post
            if (!recipe.likesByUid.includes(currentUser.uid)) {
                newLikesByUid.push(currentUser.uid);
            }
        }
        const newBody = { likesByUid: newLikesByUid, likeCount: newLikesByUid.length };
        const response = await axios.put(Recipe_URL, newBody);
        setIsLiked(!isLiked);
    }

    //save function
    function SaveRecipe() {
        const URL_ADD_SAVED_POST = `/api/recipe/savedPost/${recipe.id}/${currentUser.uid}`;
        fetch(URL_ADD_SAVED_POST, {
            method: "PUT",
            headers: {},
        });
        setIsSaved(true);
    }

    function unSaveRecipe() {
        if (isSavedPage) {
            deleteinSavedPage();
        } else {
            const URL_ADD_SAVED_POST = `/api/recipe/savedPost/${recipe.id}/${currentUser.uid}`;
            fetch(URL_ADD_SAVED_POST, {
                method: "DELETE",
                headers: {},
            });
            setIsSaved(false);
        }
    }

    //set num likes after like/unlike button pressed
    useEffect(() => {
        fetch(Recipe_URL)
            .then((response) => response.json())
            .then((data) => updateNumLikes(data.likesByUid.length));
    }, [isLiked]);

    function toggleShowFull() {
        toggleShowFullRecipe(!showFullRecipe);
    }

    function renderInstructions() {
        const arrComponents = [];
        for (let i = 0; i < recipe.instructions.length; i++) {
            arrComponents.push(<li>{recipe.instructions[i]}</li>);
        }
        return arrComponents;
    }

    function timeStamptoDate(createdAt) {
        const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
        const options = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    }

    function displayName(recipe) {
        // There is no 'user' in the recipe.

        if ("user" in recipe && "profile" in recipe.user) {
            if ("displayName" in recipe.user.profile) {
                return recipe.user.profile.displayName;
            }
        }
        if ("email" in recipe) {
            return recipe.email;
        } else {
            return "No author found!";
        }
    }

    function displayRecipeTitle(recipe) {
        return recipe.title;
    }

    function displayNumberComments() {
        if ("comments" in recipe) {
            return recipe.comments.length;
        } else {
            return 0;
        }
    }
    function handleOpenModal() {
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    return (
        <div className="border-2 border-orange-400 mb-10">
            <LikeListModal
                RecipeId={recipe.id}
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
            />

            <div className="bg-white overflow-hidden divide-y" onClick={toggleShowFull}>
                <h2 className="font-extrabold text-orange-400 text-4xl pt-2">
                    {displayRecipeTitle(recipe)}
                </h2>
                <p className="text-orange-400 pl-5 pt-2 text-left">
                    Author:
                    <Link
                        className="pl-2"
                        to={currentUser.uid === recipe.uid ? "/profile" : "/profile/" + recipe.uid}
                    >
                        {displayName(recipe)}
                    </Link>
                    {/* We concatenate the user ID to the profile route, so it redirects us to the user page on click */}
                </p>
                <p className="pl-5 pt-2 text-orange-400 text-left">
                    Date:
                    <span className="text-gray-500 pl-2 inline">
                        {timeStamptoDate(recipe.createdAt)}
                    </span>
                </p>
                <p className="text-orange-400 text-left pl-5 pt-2">
                    {" "}
                    Description:
                    <span className="inline text-gray-500 pl-2">{recipe.description}</span>
                </p>

                {recipe.categories && recipe.categories.length > 0 && (
                    <div className="pt-2">
                        <div className="flex items-center">
                            <p className="text-orange-400 text-left pl-5">Categories:</p>
                            {recipe.categories.map((category) => (
                                <div
                                    key={category}
                                    className="inline-flex items-center px-3 py-1 mr-2 rounded-full bg-orange-400 text-white"
                                >
                                    <p className="text-sm">{category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pb-2/3">
                    <Link to={`/recipe/${recipe.id}`}>
                        <img
                            className="h-full w-full object-cover aspect-[3/2]"
                            src={recipe.image}
                            alt="Recipe"
                        />
                    </Link>
                </div>

                <div className="bottomContainer">
                    <div
                        className="likes-element"
                        onClick={handleOpenModal}
                        style={{ cursor: "pointer" }}
                    >
                        {isLiked ? (
                            <IconContext.Provider value={{ color: "red" }}>
                                <div>
                                    <BsHeartFill
                                        className="likeIcon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLiked();
                                        }}
                                        size="1.6em"
                                    />{" "}
                                    <span
                                        className="likes-text"
                                        onMouseOver={(e) =>
                                            (e.target.style.textDecoration = "underline")
                                        }
                                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                                    >
                                        {numLikes} likes
                                    </span>
                                </div>
                            </IconContext.Provider>
                        ) : (
                            <IconContext.Provider value={{ color: "black" }}>
                                <div>
                                    <BsHeart
                                        className="likeIcon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLiked();
                                        }}
                                        size="1.6em"
                                    />{" "}
                                    <span
                                        className="likes-text"
                                        onMouseOver={(e) =>
                                            (e.target.style.textDecoration = "underline")
                                        }
                                        onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                                    >
                                        {numLikes} likes
                                    </span>
                                </div>
                            </IconContext.Provider>
                        )}
                    </div>

                    <div className="comment-element">
                        {" "}
                        <Link
                            to={`/recipe/${recipe.id}#comments`}
                            style={{ textDecoration: "none" }}
                        >
                            <img className="imgContainer" src={commentIcon} />{" "}
                            <span
                                style={{ textDecoration: "none" }}
                                onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                            >
                                {displayNumberComments()} Comments
                            </span>
                        </Link>
                    </div>

                    <div className="edit-element">
                        {currentUser.uid === recipe.uid && (
                            <IconContext.Provider value={{ color: "black" }}>
                                <Link to={editPostPath}>
                                    <BsBrush className="editIcon" size="2em" />
                                    Edit
                                </Link>
                            </IconContext.Provider>
                        )}
                    </div>
                    <div className="save-element">
                        {isSaved ? (
                            <IconContext.Provider value={{ color: "black" }}>
                                <div>
                                    <BsFillBookmarkFill
                                        className="saveIcon"
                                        onClick={unSaveRecipe}
                                        size="2em"
                                    />
                                </div>
                            </IconContext.Provider>
                        ) : (
                            <IconContext.Provider value={{ color: "black" }}>
                                <div>
                                    <BsBookmark
                                        className="saveIcon"
                                        onClick={SaveRecipe}
                                        size="2em"
                                    />
                                </div>
                            </IconContext.Provider>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipePost;
