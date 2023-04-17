// newTea function for post tea route
import { db } from "../firebase.js";
import { getAuth } from "firebase-admin/auth";
import { getUser } from "../controllerFunctions/userFunctions.js";
import {
    query,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    addDoc,
    deleteDoc,
    collection,
    serverTimestamp,
    orderBy,
    setDoc,
    startAfter,
    limit,
} from "firebase/firestore";

import { getStorage, deleteObject, ref } from "firebase/storage";

const addRecipe = async (req, res, next) => {
    /*
    Use bus boy, not formidable.

    */
    try {
        // console.log(storageRef._location.bucket + '/' + storageRef._location.path_);

        // const bb = busboy({ headers: req.headers });

        console.log("\nINSIDE OF RECIPE\n");

        let recipe = [];

        // bb.on('field', (name, val, info) => {
        recipe = JSON.parse(req);
        recipe["createdAt"] = serverTimestamp();
        console.log(recipe);
        // });

        const res = await addDoc(collection(db, "recipes"), recipe);

        res.writeHead(200, { Connection: "close" });
        //   res.status(200).send(`Document edited with ID: ${docRef.id}`)
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
        console.error(e);
    }
};

const addFile = async (req, res, next) => {
    const file = req.file;
    console.log(file);
    if (!file) {
        const error = new Error("No file");
        error.httpStatusCode = 400;
        return next(error);
    }
    const storage = getStorage();
    // const imgRef = ref()
    res.send(file);
};

const updateRecipe = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const docRef = doc(db, "recipes", id);
        await updateDoc(docRef, data);
        res.status(200).send(`Document edited with ID: ${docRef.id}`);
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
    }
};

const deleteRecipe = async (req, res, next) => {
    // First need to get the recipe so we can get the image URL
    // We need the image URL so we can delete the image from storage
    const id = req.params.id;
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);
    let imageURL = "";
    try {
        if (docSnap.exists()) {
            imageURL = docSnap.data()["image"];
            if (imageURL === "") {
                throw new Error("ImageURL was Invalid");
            }
        } else {
            throw new Error("Recipe not found");
        }
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
        return;
    }

    // Delete image from storage then delete whole recipe
    try {
        const storageDeleteFrom = getStorage();
        const oldImageRef = ref(storageDeleteFrom, imageURL);
        deleteObject(oldImageRef)
            .then(async () => {
                await deleteDoc(docRef);
                res.status(200).send(
                    `Document deleted with ID: ${docRef.id} and image deleted with URL ${imageURL}`
                );
            })
            .catch((e) => {
                res.status(400).send(`Failed to delete the image.  Error: ${e.message}`);
                return;
            });
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
        return;
    }
};

const getRecipe = async (req, res, next) => {
    try {
        const id = req.params.id;

        const docRef = doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);
        let recipe = docSnap.data();
        if (Object.hasOwn(docSnap.data(), "uid")) {
            const user = await getUser(docSnap.data().uid);
            recipe["user"] = user;
        }
        if (docSnap.exists()) {
            res.status(200).send(recipe);
        } else {
            // doc.data() will be undefined in this case
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
    }
};

const getRecipeByCursor = async (req, res, next) => {
    const { lastVisible, limit: maxRecipes, sortBy } = req.query;
    const recipesRef = collection(db, "recipes");
    const amount = parseInt(maxRecipes) + 1;

    const order = sortBy === "recent" ? "createdAt" : "likeCount";

    const first = query(recipesRef, orderBy(order, "desc"), limit(amount));

    try {
        let result = [];
        if (lastVisible != "null") {
            const lastVisibleDoc = await getDoc(doc(recipesRef, lastVisible));
            const nextQuery = query(
                recipesRef,
                orderBy(order, "desc"),
                startAfter(lastVisibleDoc),
                limit(amount)
            );
            const nextQuerySnapshot = await getDocs(nextQuery);
            const docs = nextQuerySnapshot.docs.map(async (docSnap) => {
                const doc = { id: docSnap.id, ...docSnap.data() };
                if (Object.hasOwn(docSnap.data(), "uid")) {
                    const user = await getUser(docSnap.data().uid);
                    doc["user"] = user;
                }
                return doc;
            });
            result = await Promise.all(docs);
            let lastVisibleDocIdUpdated = undefined;

            if (result.length > parseInt(maxRecipes)) {
                result.pop();
                lastVisibleDocIdUpdated =
                    nextQuerySnapshot.docs[nextQuerySnapshot.docs.length - 2].id;
            }

            res.status(200).send({ lastCursor: lastVisibleDocIdUpdated, data: result });
        } else {
            const firstQuerySnapshot = await getDocs(first);
            const docs = firstQuerySnapshot.docs.map(async (docSnap) => {
                const doc = { id: docSnap.id, ...docSnap.data() };
                if (Object.hasOwn(docSnap.data(), "uid")) {
                    const user = await getUser(docSnap.data().uid);
                    doc["user"] = user;
                }
                return doc;
            });
            result = await Promise.all(docs);
            let lastVisibleDocIdUpdated = undefined;

            if (result.length > parseInt(maxRecipes)) {
                result.pop();
                lastVisibleDocIdUpdated =
                    firstQuerySnapshot.docs[firstQuerySnapshot.docs.length - 2].id;
            }
            res.status(200).send({ lastCursor: lastVisibleDocIdUpdated, data: result });
        }
    } catch (error) {
        next(error);
    }
};

const getAllRecipes = async (req, res, next) => {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, "recipes"), orderBy("createdAt", "desc"))
        );
        const recipes = [];
        for (const doc of querySnapshot.docs) {
            let recipe = doc.data();
            recipe["id"] = doc.id; //Preserve the firebase document ID to be able to match recipes
            if (Object.hasOwn(doc.data(), "uid")) {
                const user = await getUser(doc.data().uid);
                recipe["user"] = user;
            }
            recipes.push(recipe);
        }
        res.status(200).send(recipes);
    } catch (e) {
        res.status(400).send(`Error: ${e.message}`);
    }
};

/////////////////////// save recipe api  ///////////////////////

const addSavedPost = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const uid = req.params["uid"];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let docSnapData = docSnap.data();
            let savedPosts = [];

            if ("savedPosts" in docSnapData) {
                savedPosts = docSnapData["savedPosts"];
            }
            if (!savedPosts.includes(id)) {
                savedPosts = [id, ...savedPosts];
            }

            docSnapData["savedPosts"] = savedPosts;

            await setDoc(docRef, docSnapData);
            res.status(200).send("successful to save");
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

const deleteSavedPost = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const uid = req.params["uid"];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let docSnapData = docSnap.data();
            let savedPosts = [];

            if ("savedPosts" in docSnapData) {
                savedPosts = docSnapData["savedPosts"];
            }
            savedPosts = savedPosts.filter((postId, index) => postId !== id);

            docSnapData["savedPosts"] = savedPosts;

            await setDoc(docRef, docSnapData);
            res.status(200).send("successful to delete");
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

const showSavedPost = async (req, res, next) => {
    try {
        const uid = req.params["uid"];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        let docSnapData = docSnap.data();
        if (docSnapData != null) {
            let savedPostsId = []; //id array
            if ("savedPosts" in docSnapData) {
                savedPostsId = docSnapData["savedPosts"];
            }
            const savedRecipesDatas = [];
            const deletedPostsId = [];
            for (const postId of savedPostsId) {
                const idRef = await doc(db, "recipes", postId);
                const idSnap = await getDoc(idRef);
                if (idSnap.exists()) {
                    let savedRecipeData = idSnap.data();
                    savedRecipeData["id"] = postId; //Preserve the firebase document ID to be able to match recipes
                    if (Object.hasOwn(savedRecipeData, "uid")) {
                        const user = await getUser(savedRecipeData["uid"]);
                        savedRecipeData["user"] = user;
                    }
                    savedRecipesDatas.push(savedRecipeData);
                } else {
                    deletedPostsId.push(postId);
                }
            }
            //delete "deleted Posts" and update data
            if (deletedPostsId != []) {
                savedPostsId = savedPostsId.filter(
                    (savedId, index) => !deletedPostsId.includes(savedId)
                );
                docSnapData["savedPosts"] = savedPostsId;
                setDoc(docRef, docSnapData);
            }
            res.status(200).send(savedRecipesDatas);
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

const reorderSavedPost = async (req, res, next) => {
    try {
        const indexBefore = req.params["indexBefore"];
        const indexAfter = req.params["indexAfter"];
        const uid = req.params["uid"];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let docSnapData = docSnap.data();
            let savedPosts = [];
            if ("savedPosts" in docSnapData) {
                savedPosts = docSnapData["savedPosts"];
            }
            const [removed] = savedPosts.splice(indexBefore, 1);
            savedPosts.splice(indexAfter, 0, removed);
            docSnapData["savedPosts"] = savedPosts;
            await setDoc(docRef, docSnapData);
            res.status(200).send("successful to reorder");
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

const checkSavedPost = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const uid = req.params["uid"];
        const docRef = await doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let docSnapData = docSnap.data();
            let savedPosts = [];
            if ("savedPosts" in docSnapData) {
                savedPosts = docSnapData["savedPosts"];
            }

            const result = savedPosts.includes(id);

            res.status(200).send(result);
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

const checkLikedPost = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const uid = req.params["uid"];
        const docRef = await doc(db, "recipes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let docSnapData = docSnap.data();
            let likesByUid = [];
            if ("likesByUid" in docSnapData) {
                likesByUid = docSnapData["likesByUid"];
            }

            const result = likesByUid.includes(uid);

            res.status(200).send(result);
        } else {
            res.status(400).send("Document not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
};

export {
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipe,
    getRecipeByCursor,
    getAllRecipes,
    addFile,
    addSavedPost,
    deleteSavedPost,
    showSavedPost,
    reorderSavedPost,
    checkSavedPost,
    checkLikedPost,
};
