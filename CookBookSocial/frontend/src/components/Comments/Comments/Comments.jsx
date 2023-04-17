import { useState, useEffect } from "react";

import CommentForm from "../CommentForm/CommentForm";
import Comment from "../Comment/Comment";

import "./comments.css";

import axios from "axios";

import { useAuth } from "../../../contexts/AuthContext";

// make api

const Comments = ({ currentUserId, recipeId, comments,onMount }) => {
  const [backendComments, setBackendComments] = useState([]);

  const [activeComment, setActiveComment] = useState(null);

  const { currentUser } = useAuth();

  //   We know is a parent because its parent is a null
  const rootComments = backendComments.filter(
    (backendComment) => backendComment.parentId === null
  );

  const getReplies = (commentId) =>
    backendComments
      .filter((backendComment) => backendComment.parentId === commentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );


  // adding a reply comment
  const addComment = (text, parentId) => {

    // Non root comments have as parent, the id of another comment
    axios
      .post("/api/comments/", {
        body: text,
        username: currentUser.displayName,
        userId: currentUserId,
        parentId: parentId,
        recipeId: recipeId,

      })
      .then((comment) => {

        // We update the backendComments array to also include the new comment
        setBackendComments([comment.data, ...backendComments]);
        setActiveComment(null);
      });
  };


  // Add a root comment
  const addRootComment = (text) => {

    // We have a function to distinguish between a root and a non root comment because root comments have as parent a null


    axios
      .post("/api/comments/", {
        body: text,
        username: currentUser.displayName,
        userId: currentUserId,
        parentId: null,
        recipeId: recipeId,

      })
      .then((comment) => {

        // We update the backendComments array to also include the new comment
        setBackendComments([comment.data, ...backendComments]);
        setActiveComment(null);
      });
  }

  const updateComment = (text, commentId) => {

    axios.put("/api/comments/edit", {
      body: text,
      commentId: commentId
    }).then(() => {
      // We find the comment in our local cache, then update its body with the new text
      const updatedBackendComments = backendComments.map((backendComment) => {
        if (backendComment.id === commentId) {
          return { ...backendComment, body: text };
        }
        return backendComment;
      });

      // We set the backendComments to be the updated version
      setBackendComments(updatedBackendComments);
      setActiveComment(null);
    });
  };

  const deleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to remove comment?")) {

      axios.delete("/api/comments/delete", {
        data: {
          commentId: commentId,
          recipeId: recipeId,
        }
      }).then(() => {
        // We remove the comment from our local cache
        const updatedBackendComments = backendComments.filter(
          (backendComment) => backendComment.id !== commentId
        );
        setBackendComments(updatedBackendComments);
      });
    }
  };


  // Fetch the comments when the app mounts
  useEffect(() => {
    axios
      .get("/api/comments/all", {
        params: {
          commentsArray: comments,
        }

      })
      .then((comments) => {
        setBackendComments(comments.data);
        onMount()
      });
    }, []);

  return (
    <div className="comments">
      <h3 className="comments-title">Comments</h3>
      <div className="comment-form-title">Write comment</div>
      <CommentForm submitLabel="Write" handleSubmit={addRootComment} />
      <div className="comments-container">
        {rootComments.map((rootComment) => (
          <Comment
            key={rootComment.id}
            comment={rootComment}
            replies={getReplies(rootComment.id)}
            activeComment={activeComment}
            setActiveComment={setActiveComment}
            addComment={addComment}
            deleteComment={deleteComment}
            updateComment={updateComment}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
};
export default Comments;
