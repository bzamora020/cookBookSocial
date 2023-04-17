import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { renderIngredients } from "./functions/MiniRecipePostFunctions";
import { useAuth } from "../../contexts/AuthContext";
import commentIcon from "../../images/commentIcon.png";

import addCommentIcon from "../../images/sendComment.png";

import likeIcon from "../../images/likeIcon.png";

import { BsHeart, BsHeartFill, BsBookmark, BsFillBookmarkFill, BsBrush } from "react-icons/bs";

import axios from "axios";

import "./MiniRecipePost.css";
import { IconContext } from "react-icons/lib";

/*
What does calling useState do? It declares a “state variable”. Our variable is called response but we could call it anything else, like banana. This is a way to “preserve” some values between the function calls. Normally, variables “disappear” when the function exits but state variables are preserved by React.
*/

function MiniRecipePost({ recipe, isSavedPage, deleteinSavedPage }) {
    const [showFullRecipe, toggleShowFullRecipe] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [numLikes, updateNumLikes] = useState(0);

    const { currentUser } = useAuth();

    const Recipe_URL = `/api/recipe/${recipe.id}`;
    /*
    useEffect(() => {
        updateNumLikes(recipe.likesByUid.length);
    }, [])
    */


    //set num likes after like/unlike button pressed
    useEffect(() => {
        fetch(Recipe_URL)
            .then((response) => response.json())
            .then((data) => updateNumLikes(data.likesByUid.length));
    }, [isLiked]);

    function toggleShowFull() {
        toggleShowFullRecipe(!showFullRecipe);
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

    return (
        <div className="border-2 rounded-md border-orange-400 mb-10">
            <div className="bg-white overflow-hidden divide-y" onClick={toggleShowFull}>
                {/* <p className="pl-5 pt-2 text-orange-400 text-left">
                    Date:
                    <p className="text-gray-500 pl-2 inline">{timeStamptoDate(recipe.createdAt)}</p>
                </p>
                <p className="text-orange-400 text-left pl-5 pt-2">
                    {" "}
                    Description:
                    <p className="inline text-gray-500 pl-2">{recipe.description}</p>
                </p> */}
                <div className="pb-2/3 relative">
                    <Link to={`/recipe/${recipe.id}`}>
                        <img
                            className="h-full w-full object-cover aspect-[3/2]"
                            src={recipe.image}
                            alt="Recipe"
                        />
                        <div class="img_overlay">
                        {" "}
                        <div className="grid grid-cols-2 gap-">
                        <li>
                        <IconContext.Provider value={{ color: "white" }}>
                                <div>
                                    <BsHeart
                                        className="likeIcon"
                                        size="2em"
                                    />
                                    {"  " + numLikes}
                                </div>
                            </IconContext.Provider>
                        </li>
                        <li>
                        <img
                            className="imgContainerComment"
                            src={commentIcon}
                        /> {" " + displayNumberComments()}
                        </li>
                        </div>
                        </div>
                    </Link>
                </div>
                <h2 className="font-extrabold text-orange-400 text-4m pt-2">
                    {displayRecipeTitle(recipe)}
                </h2>
            </div>
        </div>
    );
}

export default MiniRecipePost;
