import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import "./deleteModal.css";

export function DeleteModal({ recipeId, show, setShow }) {
    const [isLoading, setIsLoading] = useState(false);
    const [hasErrorDelete, setHasErrorDelete] = useState(false);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (recipeId) =>
            fetch(`/api/recipe/${recipeId}`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes", "allRecipes"] });
        },
    });

    function modalClosing() {
        setShow(false);
        setHasErrorDelete(false);
    }

    let navigate = useNavigate();
    const location = useLocation();

    async function deletePost() {
        setIsLoading(true);
        mutation.mutate(recipeId, {
            onError: (error) => {
                console.log("Backend failed to delete post.");
                setHasErrorDelete(true);
            },
            onSuccess: (data) => {
                setIsLoading(false);
                console.log(data);
                setShow(false);
                if (location.pathname === "/profile") {
                    window.location.reload();
                } else {
                    console.log("Redirecting....");
                    let path = "/profile";
                    navigate(path);
                }
            },
        });
    }

    if (show) {
        return (
            <div className="delete-modal overlay z-50">
                <div className="flex  mx-auto md:mt-20 px-8 py-4 md:rounded-lg max-h-52 min-w-[40%] max-w-m bg-white shadow-xl">
                    <div className="m-auto w-full">
                        {isLoading && !hasErrorDelete && (
                            <div className="">
                                <div className="spinner-border text-danger" role="status">
                                    <span className="sr-only">Deleting...</span>
                                </div>
                                <div className="text-xl py-5 delete-modal confirmation-text">
                                    Deleting...
                                </div>
                            </div>
                        )}
                        {!isLoading && !hasErrorDelete && (
                            <div className="text-black text-left">
                                <h3 className="text-xl font-bold mb-4">Delete Recipe?</h3>
                                <div className="text-black">
                                    Are you sure you want to delete this recipe?
                                </div>
                                <div className="text-gray-600">This action cannot be undone.</div>
                                <div className="text-right mt-4">
                                    <button
                                        onClick={() => modalClosing()}
                                        type="button"
                                        className="mr-2 font-medium text-blue-600 hover:bg-blue-100 rounded py-2 px-4 transition-all duration-200 ease-in-out"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => deletePost()}
                                        type="button"
                                        className="font-medium text-white bg-red-600 hover:bg-red-800 py-2 px-4 rounded transition-all duration-200 ease-in-out"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                        {hasErrorDelete && !isLoading && (
                            <div className="delete-modal">
                                <div className="text-xl py-5 delete-modal confirmation-text">
                                    Error - Failed to Delete Recipe
                                </div>
                                <div></div>

                                <span
                                    onClick={() => modalClosing()}
                                    type="button"
                                    className="btn btn-info m-2"
                                >
                                    Return
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

export default function DeleteButton({ recipeId, isRecipePage }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <span>
            <span
                type="button"
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-lg px-5 py-2.5 text-center mr-2 mb-2 "
                onClick={() => setShowModal(true)}
            >
                Delete
            </span>
            <DeleteModal recipeId={recipeId} show={showModal} setShow={setShowModal} />
        </span>
    );
}
