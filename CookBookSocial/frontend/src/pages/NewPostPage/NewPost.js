import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/Navbar/Navbar";
import PostForm from "../../components/PostForm/PostForm";
import { useNavigate } from "react-router-dom";
import { firebaseUpload } from "../../utils/Api";
import { useAuth } from "../../contexts/AuthContext";

function NewPost() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (obj) => firebaseUpload(obj.image, obj.recipe),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes", "allRecipes"] });
        },
    });
    const { currentUser } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            // If the user does not already have user data, we redirect them to the edit-profile
            if (!currentUser.displayName) {
                navigate("/edit-profile");
            }
        }
    }, []);

    const initialValues = {
        title: "",
        description: "",
        uid: "",
        ingredientList: [],
        stepList: [],
        stepText: "",
        image: "",
        categories: [],
    };

    const handleSubmit = async (image, recipe, imageChanged) => {
        mutation.mutate(
            { image: image, recipe: recipe },
            {
                onSuccess: () => {
                    navigate("/");
                },
                onError: (error) => {
                    console.error(error);
                    alert("Error uploading image");
                },
            }
        );
        // firebaseUpload(image, recipe)
        //     .then(() => {
        //         navigate("/");
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //         alert("Error uploading image");
        //     });
    };

    return (
        <>
            <Navbar />
            <PostForm initialValues={initialValues} onSumbit={handleSubmit} heading="New Recipe" />
        </>
    );
}

export default NewPost;
