import { db } from "../firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

const getComments = async (req, res, next) => {
  try {
    // Look up the array of comments

    const comments = [];

    // When I wrote this, I did it to check if the comments array is undefined
    // If the comments array is undefined, then the query length is 0
    // (I probably should have sent an empty array or check beforehand on the front end, to avoid this)ß
    if (Object.keys(req.query).length === 0) {
      res.status(200).send(comments);
    } else {
      // We traverse throught the comments array
      for (let i = 0; i < req.query.commentsArray.length; i++) {
        const id = req.query.commentsArray[i];

        const docRef = doc(db, "comments", id);
        const docSnap = await getDoc(docRef);

        // We check if the doc exists
        if (docSnap.exists()) {
          // If doc exists, we retrieve its data, and set the id field to be the docId.
          // Then we push this comment into the array
          let comment = docSnap.data();
          comment["id"] = docSnap.id;

          comments.push(comment);
        }
      }

      // We return the comments array
      res.status(200).send(comments);
    }
    // const comment =
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`);
  }
};

const addComment = async (req, res, next) => {
  try {
    let comment = req.body;

    // The comment object contains
    // body:
    // username:
    // userId:
    // parentId:
    // recipeId:

    comment["createdAt"] = serverTimestamp();

    // Now the comment object contains
    // body:
    // username:
    // userId:
    // parentId:
    // recipeId:
    // createdAt:

    let commentId = await addDoc(collection(db, "comments"), comment);
    const commentObj = await getDoc(commentId);

    commentId = commentId.id;

    // We first add the comment into the comments collection.
    // Then we retrieve its id because we need it to add it to the recipePost "comments" array

    const recipeRef = doc(db, "recipes", comment.recipeId);

    const recipeDocSnap = await getDoc(recipeRef);
    let recipe = recipeDocSnap.data();

    // Safety check to see if the document currently has the comments property
    if (recipe.hasOwnProperty("comments")) {
      let comments = recipe["comments"];
      comments.push(commentId);
      recipe["comments"] = comments;
    } else {
      recipe["comments"] = [commentId];
    }

    // We update the comments array from the recipe object
    await updateDoc(recipeRef, recipe);

    // We store the created comment into another variable so we can add the id field to it
    let newComment = commentObj.data();

    // We add the id to the comment, so the front end does not give us a "key-id" warning
    newComment["id"] = commentId;

    res.status(200).send(newComment);
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const commentId = req.body.commentId;
    const text = req.body.body;

    const commentRef = doc(db, "comments", commentId);
    const commentSnap = await getDoc(commentRef);

    // We obtain the doc from the database
    let comment = commentSnap.data();

    // We replace the old body with the new text
    comment["body"] = text;

    // Update the comment doc in the collection
    await updateDoc(commentRef, comment);

    // Return the updated comment

    res.status(200).send(comment);
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const object = req.body;

    const commentRef = doc(db, "comments", object.commentId);

    // We delete the comment from the comments collection

    await deleteDoc(commentRef);

    // We obtain the corresponding recipe post from the collection
    const recipeRef = doc(db, "recipes", object.recipeId);

    const recipeSnap = await getDoc(recipeRef);

    let recipe = recipeSnap.data();

    // We delete the comment id from the comments array in the recipe document
    let commentsArray = recipe["comments"];

    let commentIndex = commentsArray.indexOf(object.commentId);
    commentsArray.splice(commentIndex, 1);

    recipe["comments"] = commentsArray;

    // We update the recipe document in the collection, so it does not contain that comment

    await updateDoc(recipeRef, recipe);

    res.status(200).send("Comment deleted");
  } catch (e) {
    res.status(400).send(`Error: ${e.message}`);
  }
};

export { getComments, addComment, updateComment, deleteComment };
