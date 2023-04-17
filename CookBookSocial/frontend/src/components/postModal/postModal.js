import "./postModalStyles.css";
import React, { useState, useEffect } from "react";
import { firebaseUpload } from "../../utils/Api";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

//add Recipe modal button by adding <PostButton/>

//recipe ingredients
const IngreLists = (props) => {
    // Ingre List
    const [ingreText, setIngreText] = useState("");

    // manage input form
    const onChangeIngreText = (event) => {
        setIngreText(event.target.value);
    };

    // add ingre to list
    const onClickAdd = () => {
        if (ingreText === "") return;

        props.ingredientList.push(ingreText);
        setIngreText("");
    };

    // delete ingre form list
    const onClickDelete = (index) => {
        const deletedIngreList = [...props.ingredientList];
        deletedIngreList.splice(index, 1);
        props.setIngredientList(deletedIngreList);
    };

    return (
        <>
            <h2 className="modalTitle">Ingredients: </h2>
            <table>
                {
                    <tbody id="ingre-body">
                        {props.ingredientList.map((ingre, index) => (
                            <tr key={index}>
                                <td className="modalSub">{ingre}</td>
                                <td>
                                    <button
                                        className="delIngButton"
                                        onClick={() => onClickDelete(index)}
                                    >
                                        -
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                }
            </table>
            <div className="add-Ingre">
                <input
                    className="ingInput text-black"
                    value={ingreText}
                    onChange={onChangeIngreText}
                />
                <button className="addIngButton text-black" onClick={onClickAdd}>
                    add
                </button>
            </div>
        </>
    );
};

//recipe step
const StepLists = (props) => {
    // step List

    // manage input form
    const onChangeStepText = (event) => {
        props.setStepText(event.target.value);
    };

    // add step to list
    const onClickAdd = () => {
        if (props.stepText === "") return;
        props.stepList.push(props.stepText);
        // reset add step form to ""
        props.setStepText("");
    };
    //change step description
    const onChangeOldStep = (index, updateText) => {
        const ChangedStepList = [...props.stepList];
        ChangedStepList[index] = updateText;
        props.setStepList(ChangedStepList);
    };

    // delete step form list
    const onClickDelete = (index) => {
        const deletedStepList = [...props.stepList];
        deletedStepList.splice(index, 1);
        props.setStepList(deletedStepList);
    };

    return (
        <>
            <h2 className="modalTitle">steps: </h2>
            {props.stepList.map((step, index) => (
                <div className="stepList" key={index}>
                    <div className="stepListIndex">step {index + 1}:</div>
                    <textarea
                        className="modalStepDesc text-black"
                        value={step}
                        onChange={(event) => onChangeOldStep(index, event.target.value)}
                    ></textarea>
                    <button className="stepListbutton" onClick={() => onClickDelete(index)}>
                        -
                    </button>
                </div>
            ))}
            <div className="stepList">
                <div className="stepListIndex">step {props.stepList.length + 1}:</div>
                <textarea
                    className="modalStepDesc text-black"
                    value={props.stepText}
                    onChange={onChangeStepText}
                />
                <button className="stepListbutton" onClick={onClickAdd}>
                    +
                </button>
            </div>
        </>
    );
};

export function Modal({ show, setShow }) {
    const [isError, setIsError] = useState(false);
    const [errorOutput, setErrorOutput] = useState("");

    const [image, setImage] = useState([]);
    const [prevImg, setPrevImg] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        uid: "",
        ingredientList: [],
        stepList: [],
        stepText: "",
    });

    const { title, description, stepText, stepList, ingredientList } = formData;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentUser } = useAuth();

    useEffect(() => {
        setFormData({
            ...formData,
            uid: currentUser.uid,
        });
    }, [currentUser.uid]);

    const [recipe, updateRecipe] = useState({
        title: "",
        description: "",
        uid: currentUser.uid,
        ingredients: [],
        instructions: [],
        likesByUid: [],
    });

    useEffect(() => {
        updateRecipe({
            ...recipe,
            title: title,
            description: description,
            uid: currentUser.uid,
            ingredients: ingredientList,
            instructions: stepList,
        });
    }, [title, description, currentUser.uid, ingredientList, stepList]);

    function validate(input) {
        const errorMessages = [];
        Object.keys(input).forEach((key) => {
            const value = input[key];
            const rules = validationRules[key];
            if (!rules) {
                return;
            }
            if (rules.required && !value) {
                errorMessages.push(`Invalid ${key}!`);
            }
            if (rules.isArray && (!value || !value.length)) {
                errorMessages.push(`Invalid ${key}!`);
            }
        });
        return errorMessages.join(" ");
    }

    const validationRules = {
        title: { required: true },
        description: { required: true },
        uid: { required: true },
        ingredients: { isArray: true },
        image: { required: true },
    };

    function handleImage(pic) {
        setImage(pic);
        setPrevImg(URL.createObjectURL(pic));
    }

    function modalClosing() {
        setShow(false);
        setShow(false);
        setIsError(false);
        setErrorOutput("");
        setFormData({
            title: "",
            description: "",
            uid: "",
            ingredientList: [],
            stepList: [],
            stepText: "",
            image: [],
            prevImg: "",
        });
    }

    function postRecipe() {
        // add step text to step List if it is not empty
        if (stepText !== "") {
            stepList.push(stepText);
        }

        // Validate the input
        const validationError = validate({
            title: recipe.title,
            description: recipe.description,
            uid: recipe.uid,
            ingredients: recipe.ingredients,
            image: image,
        });

        if (validationError) {
            setIsError(true);
            setErrorOutput(validationError);
            return false;
        }
        setIsError(false);
        setIsSubmitting(true);
        // console.log("IMAGE NAME: ", image.name);

        // Here we are uploading the image first, that way we can make sure the uploaded image is correct
        console.log("RECIPE INFO: ", recipe);
        console.log(image);

        firebaseUpload(image, recipe)
            .then(() => {
                modalClosing();
                console.log("Closing modal");
                window.location.reload(false);
            })
            .catch((error) => {
                console.error(error);
                alert("Error uploading image");
            });
    }

    if (show) {
        return (
            <div id="overlay">
                <div id="content">
                    {isError && <div id="postModal-error-log">{errorOutput}</div>}

                    <div className="container container-column">
                        <div className="putLeft">
                            <button className="postModal-close" onClick={() => modalClosing()}>
                                Close
                            </button>
                        </div>
                        {/* top part */}
                        <div className="flex_first-box">
                            <div className="flex_first-item"> </div>
                            <div className="flex_first-item">
                                <div>
                                    <p className="modalTitle">Image</p>
                                    <form>
                                        <input
                                            id="postModal-img-input"
                                            type="file"
                                            accept="image/png, image/gif, image/jpeg"
                                            onChange={(event) => handleImage(event.target.files[0])}
                                        />
                                    </form>

                                    {prevImg && (
                                        <div className="prevPicContainer">
                                            <img className="prevImage" src={prevImg} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex_first-item">
                                <div className="postConfirm">
                                    {isSubmitting ? (
                                        <FaSpinner className="loading-spinner" />
                                    ) : (
                                        <button onClick={() => postRecipe()}>Post Now</button>
                                    )}
                                </div>
                                <div className="titleContainers">
                                    <p className="modalTitle">Title</p>
                                    <input
                                        className="text-xl h-8 w-4/5 text-black"
                                        value={title}
                                        onChange={(event) =>
                                            setFormData({ ...formData, title: event.target.value })
                                        }
                                        placeholder="Recipe Name"
                                    />
                                </div>

                                <p className="modalTitle">Description</p>
                                <textarea
                                    className="modalRecipeDesc text-black"
                                    value={description}
                                    onChange={(event) =>
                                        setFormData({
                                            ...formData,
                                            description: event.target.value,
                                        })
                                    }
                                    placeholder="Description"
                                ></textarea>
                            </div>
                        </div>
                        {/* second Part */}
                        <div className="flex_second-box">
                            <div className="flex_second-item">
                                <IngreLists
                                    ingredientList={ingredientList}
                                    setIngredientList={(ingredientList) =>
                                        setFormData({ ...formData, ingredientList })
                                    }
                                />
                            </div>
                            <div className="flex_second-item">
                                <StepLists
                                    stepList={stepList}
                                    setStepList={(stepList) =>
                                        setFormData({ ...formData, stepList })
                                    }
                                    stepText={stepText}
                                    setStepText={(stepText) => {
                                        setFormData({ ...formData, stepText });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return null;
    }
}

export default function PostButton() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div>
            <button onClick={() => setShowModal(true)}>New Post</button>
            <Modal show={showModal} setShow={setShowModal} />
        </div>
    );
}
