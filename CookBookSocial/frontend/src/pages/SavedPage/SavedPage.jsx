import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import RecipePost from "../../components/RecipePosts/RecipePost";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../../contexts/AuthContext";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


// reorder item function
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

export default function SavedPage() {
    const [searchState, setSearchState] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [recipePostsList, updateRecipePostsList] = useState([]);
    const { currentUser } = useAuth();
    const URL_GET_SAVED_RECIPE_POSTS_DATA = `/api/recipe/savedPost/${currentUser.uid}`;
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            // If the user does not already have user data, we redirect them to the edit-profile
            if (!currentUser.displayName) {
              navigate("/edit-profile");
            }
          }


        const handleBeforeUnload = () => {
            sessionStorage.setItem("scrollPosition", window.scrollY);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        const scrollPosition = sessionStorage.getItem("scrollPosition");
        if (scrollPosition !== null) {
            window.scrollTo(0, parseInt(scrollPosition));
        }

        fetch(URL_GET_SAVED_RECIPE_POSTS_DATA)
            .then((response) => response.json())
            .then((data) => {
                updateRecipePostsList(data);
                setIsLoading(false);
            })
            .catch((error) => console.log(error));

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const scrollPosition = sessionStorage.getItem("scrollPosition");
        if (scrollPosition !== null) {
            document.documentElement.style.scrollBehavior = "smooth"; //make the scroll smooth again, tailwind overrided this before
            window.scrollTo(0, parseInt(scrollPosition));
        }
    }, [recipePostsList]);

    //get saved data
    useEffect(() => {
        const URL_GET_SAVED_RECIPE_POSTS_DATA = `/api/recipe/savedPost/${currentUser.uid}`;
        const access_db = () => {
            fetch(URL_GET_SAVED_RECIPE_POSTS_DATA)
                .then((response) => response.json())
                .then((data) => updateRecipePostsList(data));
        };
        access_db();
    }, []);

    const onDragEnd = (result) => {
        // no drag
        if (!result.destination) {
            return;
        }
        const indexBefore = result.source.index;
        const indexAfter = result.destination.index;

        // reorder item
        let movedItems = reorder(recipePostsList, indexBefore, indexAfter);
        updateRecipePostsList(movedItems);
        //update firebase data
        const URL_DELETE_SAVED_RECIPE_POSTS = `/api/recipe/reorderSavedPost/${currentUser.uid}/${indexBefore}/${indexAfter}`;

        const response = fetch(URL_DELETE_SAVED_RECIPE_POSTS, {
            method: "PUT",
            headers: {},
        });
    };

    return (
        <div>
            <Navbar />
            <div className="mt-8"></div>
            <div className="max-w-2xl mx-auto my-2">
                {isLoading ? (
                    <div className="loading-container">
                        <FaSpinner className="loading-spinner" />
                    </div>
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {recipePostsList.map((savedRecipe, index) => (
                                        <Draggable
                                            key={savedRecipe.id}
                                            draggableId={"q-" + savedRecipe.id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <div>
                                                        <RecipePost
                                                            deleteinSavedPage={() => {
                                                                const newRecipePostsList = [
                                                                    ...recipePostsList,
                                                                ];
                                                                newRecipePostsList.splice(index, 1);
                                                                updateRecipePostsList(
                                                                    newRecipePostsList
                                                                );
                                                                //update database
                                                                const URL_DELETE_SAVED_RECIPE_POSTS = `/api/recipe/savedPost/${recipePostsList[index].id}/${currentUser.uid}`;
                                                                const response = fetch(
                                                                    URL_DELETE_SAVED_RECIPE_POSTS,
                                                                    {
                                                                        method: "DELETE",
                                                                        headers: {},
                                                                    }
                                                                );
                                                            }}
                                                            isSavedPage={true}
                                                            recipe={savedRecipe}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </div>
        // draggable area
    );
}
