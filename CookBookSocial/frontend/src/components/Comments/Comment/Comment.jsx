import { Link } from "react-router-dom";
import CommentForm from "../CommentForm/CommentForm";


import "./comment.css"

const Comment = ({
  comment,
  replies,
  setActiveComment,
  activeComment,
  updateComment,
  deleteComment,
  addComment,
  parentId = null,
  currentUserId,
}) => {
  const isEditing =
    activeComment &&
    activeComment.id === comment.id &&
    activeComment.type === "editing";

  const isReplying =
    activeComment &&
    activeComment.id === comment.id &&
    activeComment.type === "replying";

  const canDelete = currentUserId === comment.userId && replies.length === 0;

  const canReply = Boolean(currentUserId);

  const canEdit = currentUserId === comment.userId;

  const replyId = parentId ? parentId : comment.id;


  function timeStamptoDate(createdAt) {
    const date = new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  const createdAt = timeStamptoDate(comment.createdAt);



  return (
    // Whole comment
    <div key={comment.id} className="comment">
      {/* Image container */}
      <div className="comment-image-container">
        {/* <img src="" alt="userIcon"/> */}
      </div>
      {/* Right side of the comment */}
      <div className="comment-right-part">
        <div className="comment-content">
          <div className="comment-author"><Link to={'/profile/' + comment.userId}> {comment.username}</Link></div>
          <div className="comment-date">{createdAt}</div>
        </div>

        {/* Comment body */}
        {!isEditing && <div className="comment-text">{comment.body}</div>}

        {/* Editing comment */}
        {isEditing && (
          <CommentForm
            submitLabel="Update"
            hasCancelButton
            initialText={comment.body}
            handleSubmit={(text) => updateComment(text, comment.id)}
            handleCancel={() => {
              setActiveComment(null);
            }}
          />
        )}


        {/* We split the comment actions into reply, edit, and delete */}
        <div className="comment-actions">

          {/* Reply action */}
          {canReply && (
            <div
              className="comment-action"
              onClick={() =>
                setActiveComment({ id: comment.id, type: "replying" })
              }
            >
              Reply
            </div>
          )}

          {/* Edit action */}
          {canEdit && (
            <div
              className="comment-action"
              onClick={() =>
                setActiveComment({ id: comment.id, type: "editing" })
              }
            >
              Edit
            </div>
          )}

          {/* Delete action */}
          {canDelete && (
            <div
              className="comment-action"
              onClick={() => deleteComment(comment.id)}
            >
              Delete
            </div>
          )}
        </div>

        {/* Render replying form when trying to reply */}
        {isReplying && (
          <CommentForm
            submitLabel="Reply"
            handleSubmit={(text) =>
              addComment(text, replyId)
            }
          />
        )}


        {/* When a comment has replies, we also render those */}

        {replies.length > 0 && (
          <div className="replies">
            {replies.map((reply) => (
              <Comment
                comment={reply}
                key={reply.id}
                setActiveComment={setActiveComment}
                activeComment={activeComment}
                updateComment={updateComment}
                deleteComment={deleteComment}
                addComment={addComment}
                parentId={comment.id}
                replies={[]}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
