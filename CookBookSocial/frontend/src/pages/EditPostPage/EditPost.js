import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { firebaseUpdate } from "../../utils/Api";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar/Navbar";

import PostForm from "../../components/PostForm/PostForm";
import { DeleteModal } from "../../components/deleteModal/deleteModal";

export default function EditPost() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (obj) =>
            firebaseUpdate(obj.id, obj.image, obj.recipe, obj.oldImage, obj.imageChanged),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes", "allRecipes"] });
        },
    });

    const [initialValues, setInitialValues] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { currentUser } = useAuth();

    const { id } = useParams();

    const URL_GET_RECIPE_BY_ID = `/api/recipe/${id}`;

    useEffect(() => {
        if (currentUser) {
            // If the user does not already have user data, we redirect them to the edit-profile
            if (!currentUser.displayName) {
                navigate("/edit-profile");
            }
        }

        fetch(URL_GET_RECIPE_BY_ID)
            .then((response) => response.json())
            .then((data) => {
                if (currentUser && currentUser.uid !== data.uid) {
                    navigate("/home");
                }
                setInitialValues({
                    title: data.title,
                    description: data.description,
                    uid: data.uid,
                    ingredientList: data.ingredients,
                    stepList: data.instructions,
                    stepText: "",
                    image: data.image,
                    likesByUid: data.likesByUid,

                    // Checks if the recipe has a category field already. Otherwhise it sets a default value
                    categories: data.categories ? data.categories : [],
                });
                setOldImage(data.image);
            });
    }, []);

    let navigate = useNavigate();

    const postRecipe = async (image, recipe, imageChanged) => {
        mutation.mutate(
            {
                id: id,
                image: image,
                recipe: {
                    recipe,
                    likesByUid: initialValues.likesByUid, 
                },
                oldImage: oldImage,
                imageChanged: imageChanged,
            },
            {
                onSuccess: () => {
                    navigate("/");
                },
                onError: (error) => {
                    console.error(error);
                    alert("Error updating recipe");
                },
            }
        );
    };

    const onClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <Navbar />
            {initialValues && (
                <div className="mt-2">
                    <DeleteModal recipeId={id} show={showModal} setShow={setShowModal} />
                    <PostForm
                        initialValues={initialValues}
                        onSumbit={postRecipe}
                        heading="Edit Recipe"
                    />
                    <button
                        onClick={onClick}
                        className="font-medium text-white bg-red-600 hover:bg-red-800 -mt-16 mb-8 py-2 px-4 rounded transition-all duration-200 ease-in-out"
                    >
                        Delete Recipe
                    </button>
                </div>
            )}
        </>
    );
}
