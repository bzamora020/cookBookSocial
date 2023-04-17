import React, { useEffect, useState } from "react";
import RecipePost from "../../components/RecipePosts/RecipePost";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import { FaSpinner } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import "./HomePage.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function HomePage() {
    const [recipes, setRecipes] = useState([]);
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ value: "recent", label: "Filter" });
    const { currentUser } = useAuth();
    const [categoriesList, setCategoriesList] = useState([]);

    const [selected, setSelected] = useState(null);

    const navigate = useNavigate();

    const POSTS_AT_A_TIME = 5;
    const [numPosts, setNumPosts] = useState(
        parseInt(sessionStorage.getItem("numPosts")) || POSTS_AT_A_TIME
    );

    const fetchRecipesRecent = async ({ pageParam = null }) => {
        const res = await fetch(
            "/api/recipe/cursor?limit=10&sortBy=recent&lastVisible=" + pageParam
        );
        return res.json();
    };

    const {
        data: recipeData,
        fetchNextPage,
        hasNextPage,
        isFetching: recipeLoading,
    } = useInfiniteQuery({
        queryKey: ["recipes"],
        queryFn: fetchRecipesRecent,
        getNextPageParam: (lastPage, pages) => lastPage.lastCursor,
    });

    const { data: allRecipeData, isLoading: allRecipesLoading } = useQuery({
        queryKey: ["allRecipes"],
        queryFn: () => fetch("/api/recipe/all").then((res) => res.json()),
    });

    const { data: friendsData, isLoading: friendsLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: () => fetch(`/api/user/friendsList/${currentUser.uid}`).then((res) => res.json()),
    });

    // Initial render
    useEffect(() => {
        if (currentUser) {
            // If the user does not already have user data, we redirect them to the edit-profile
            if (!currentUser.displayName) {
                navigate("/edit-profile");
            }
        }

        const handleBeforeUnload = () => {
            console.log(window.ScrollY);
            sessionStorage.setItem("scrollPosition", window.scrollY);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        const scrollPosition = sessionStorage.getItem("scrollPosition");
        if (scrollPosition !== null) {
            window.scrollTo(0, parseInt(scrollPosition));
        }

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Handles data fetches from infinite scroll
    useEffect(() => {
        // set numPosts to number of posts within recipeData.pages, an array of pages with variable length
        if (recipeData) {
            let numPosts = 0;
            recipeData.pages.forEach((page) => {
                numPosts += page.data.length;
            });
            setNumPosts(numPosts);
            sessionStorage.setItem("numPosts", numPosts);
        }

        // Flatten recipeData into a single array of recipes.
        if (recipeData) {
            let recipes = [];
            recipeData.pages.forEach((page) => {
                page.data.forEach((recipe) => {
                    recipes.push(recipe);
                });
            });
            setRecentRecipes(recipes);
        }
    }, [recipeData]);

    // Updates recipes based on filter selection
    useEffect(() => {
        if (filter.value === "recent") {
            setRecipes(recentRecipes);
        } else if (filter.value === "likes") {
            if (!allRecipesLoading) {
                setRecipes(
                    allRecipeData
                        .sort((postA, postB) => postB.likesByUid.length - postA.likesByUid.length)
                        .slice(0, 10)
                );
            }
        } else {
            if (!friendsLoading && !allRecipesLoading) {
                setRecipes(
                    allRecipeData.filter((recipePost) =>
                        Object.keys(friendsData).includes(recipePost.uid)
                    )
                );
            }
        }
    }, [filter, recentRecipes, allRecipeData, loading, friendsData]);

    // Reset scroll position
    useEffect(() => {
        // if (recipeData) {
        //     const scrollPosition = sessionStorage.getItem("scrollPosition");
        //     if (scrollPosition !== null) {
        //         document.documentElement.style.scrollBehavior = "smooth";
        //         setTimeout(function () {
        //             window.scrollTo(0, parseInt(scrollPosition));
        //         }, 200);
        //     }
        // }
    }, [recipeData]);

    // Generates categories
    useEffect(() => {
        const categories = new Set();
        for (const recipe of recipes) {
            if (recipe.categories) {
                recipe.categories.forEach((cat) => categories.add(cat));
            }
        }

        let categoriesList = [...categories].sort().map((cat) => ({ value: cat, label: cat }));
        categoriesList.unshift({ value: null, label: "None" });
        setCategoriesList(categoriesList);
    }, [recipes]);

    // Handles loading state
    useEffect(() => {
        setLoading(
            (recipeLoading && !recipeData) ||
                (filter.value !== "recent" && (allRecipesLoading || friendsLoading))
        );
    }, [recipeLoading, allRecipesLoading, friendsLoading, filter, recipeData]);

    const customStyles = {
        option: (defaultStyles, state) => ({
            ...defaultStyles,
            color: state.isSelected ? "white" : "black",
            backgroundColor: state.isSelected ? "orange" : "#FFDC9C",
        }),
        placeholder: (defaultStyles) => ({
            ...defaultStyles,
            color: "black",
            fontWeight: "bold",
        }),
        dropdownIndicator: (defaultStyles) => ({
            ...defaultStyles,
            color: "black",
        }),

        indicatorSeparator: (defaultStyles) => ({
            ...defaultStyles,
            display: "none",
        }),

        control: (defaultStyles) => ({
            ...defaultStyles,
            backgroundColor: "#FFDC9C",
            marginTop: "10px",
            paddingTop: "3px",
            paddingBottom: "3px",
            paddingRight: "10px",
            paddingLeft: "10px",
            border: "none",
            boxShadow: "none",
            color: "white",
            fontWeight: "bold",
        }),
        singleValue: (defaultStyles) => ({ ...defaultStyles, color: "black" }),
    };

    const filterByCategory = async (selectedOption) => {
       await setSelected(selectedOption);
    };

    const renderList = (type) => {
        const recipeList =
            !selected || selected.value == null
                ? recipes
                : recipes.filter((recipePost) => {
                      if (recipePost["categories"]) {
                          return recipePost["categories"].includes(selected.value);
                      }
                  });

        if (type === "recent") {
            return (
                <InfiniteScroll
                    dataLength={numPosts}
                    next={fetchNextPage}
                    hasMore={hasNextPage}
                    loader={
                        <div className="loading-container">
                            <FaSpinner className="loading-spinner" />
                        </div>
                    }
                >
                    {recipeList.map((recipe, i) => (
                        <RecipePost key={i} recipe={recipe} />
                    ))}
                </InfiniteScroll>
            );
        } else {
            return recipeList.map((recipe, index) => (
                <RecipePost key={index + 2000} recipe={recipe} />
            ));
        }
    };

    const updateFilter = async (type) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 250));
        await setFilter(type);
        await new Promise((resolve) => setTimeout(resolve, 250));

        setLoading(false);
    };

    return (
        <div>
            <Navbar />
            <div className="mt-8"></div>
            <div className="max-w-2xl mx-auto my-2">
                <div>
                    <div className="flex justify-between mb-4">
                        <Select
                            options={[
                                { value: "recent", label: "Recent" },
                                { value: "likes", label: "Popular" },
                                { value: "friends", label: "Friends" },
                            ]}
                            value={filter}
                            onChange={(option) => updateFilter(option)}
                            placeholder="Filter"
                            styles={customStyles}
                            className="font-semibold text-left"
                        />
                        <Select
                            options={categoriesList}
                            value={selected || ""}
                            onChange={filterByCategory}
                            placeholder="Categories"
                            styles={customStyles}
                        />
                    </div>
                    <hr align="center" className="hr-line mb-4"></hr>
                </div>
                {loading ? (
                    <div className="loading-container">
                        <FaSpinner className="loading-spinner" />
                    </div>
                ) : (
                    renderList(filter.value)
                )}
            </div>
        </div>
    );
}

export default HomePage;
