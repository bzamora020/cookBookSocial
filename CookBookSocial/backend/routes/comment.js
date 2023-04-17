import express from "express";

import {
  updateComment,
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentsController.js";

const commentsRouter = express.Router();

/**
 * @swagger
 * /api/comments/all:
 *   get:
 *     description: Returns an array of all comments in a post
 *     responses:
 *       200:
 *         description: Returns an array of all comments in a post.
 */
commentsRouter.get("/all", getComments);

/**
 * @swagger
 * /api/comments/all:
 *   post:
 *     description: Creates a new comment in firestore
 *     responses:
 *       200:
 *         description: Returns success message
 */
commentsRouter.post("/", addComment);

/**
 * @swagger
 * /api/comments/edit:
 *   post:
 *     description: Edits comment in firestore
 *     responses:
 *       200:
 *         description: Returns success message
 */
commentsRouter.put("/edit", updateComment);

/**
 * @swagger
 * /api/comments/delete:
 *   post:
 *     description: Deletes comment in firestore
 *     responses:
 *       200:
 *         description: Returns success message
 */
commentsRouter.delete("/delete", deleteComment);

export default commentsRouter;
