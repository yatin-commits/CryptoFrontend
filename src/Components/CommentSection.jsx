import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";

const CommentSection = () => {
  // Get the current user's ID from context
  const { uid } = useUser();
  // Get the 'symbol' from the URL (e.g., 'btc')
  const { symbol } = useParams();
  // State to store the list of comments
  const [comments, setComments] = useState([]);
  // State for the new comment input field
  const [newComment, setNewComment] = useState("");
  // State to track user actions (liked/disliked) for each comment
  const [userActions, setUserActions] = useState({});
  // State to show loading message
  const [loading, setLoading] = useState(false);
  // Function to fetch comments from the server
  const fetchComments = async () => {
    setLoading(true); // Show "Loading..." while fetching
    try {
      const { data } = await axios.get(`https://backendcrypto.onrender.com/api/comments/${symbol}`, {
        withCredentials: true, // Send cookies for authentication
      });
      setComments(data || []); // Update comments list

      // Set up userActions: check if the user has liked or disliked each comment
      const actions = {};
      data.forEach((comment) => {
        actions[comment.id] = {
          liked: comment.user_likes?.split(",").includes(uid) || false, // True if user liked
          disliked: comment.user_dislikes?.split(",").includes(uid) || false, // True if user disliked
        };
      });
      setUserActions(actions);
    } catch (error) {
      toast.error("Failed to fetch comments");
    } finally {
      setLoading(false); // Hide "Loading..."
    }
  };

  // Function to post a new comment
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    try {
      const { data } = await axios.post(
        `https://backendcrypto.onrender.com/api/comments/${symbol}`,
        { user_id: uid, content: newComment },
        { withCredentials: true }
      );
      // Add the new comment to the UI right away (optimistic update)
      setComments([
        {
          id: data.id,
          user_id: uid,
          username: "You",
          content: newComment,
          created_at: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          reports: 0,
        },
        ...comments,
      ]);
      // Update userActions for the new comment
      setUserActions((prev) => ({ ...prev, [data.id]: { liked: false, disliked: false } }));
      setNewComment(""); // Clear the input field
      toast.success("Comment posted");
    } catch (error) {
      toast.error("Failed to post comment");
      fetchComments(); // Refresh comments if the server fails
    }
  };

  // Function to like or dislike a comment (handles all 4 cases)
const handleAction = async (commentId, action) => {
  
  // Get the comment's current likes and dislikes
  let comment = comments.find((c) => c.id === commentId);
  let likes = comment.likes || 0;
  let dislikes = comment.dislikes || 0;

  // Get if user already liked or disliked this comment
  let userAction = userActions[commentId] || { liked: false, disliked: false };
  let userLiked = userAction.liked;
  let userDisliked = userAction.disliked;

  // Variables to update UI and send to server
  let newLikes = likes;
  let newDislikes = dislikes;
  let newUserLiked = userLiked;
  let newUserDisliked = userDisliked;
  let serverAction = "";

  // If user clicks "Like"
  if (action === "like") {
    // User hasn't liked or disliked yet
    if (!userLiked && !userDisliked) {
      newLikes = likes + 1; // Add a like
      newUserLiked = true; // Mark as liked
      serverAction = "like";
    }
    // User already liked, so remove the like
    else if (userLiked && !userDisliked) {
      newLikes = likes - 1; // Remove the like
      newUserLiked = false; // Mark as not liked
      serverAction = "unlike";
    }
    // User disliked, so switch to like
    else if (!userLiked && userDisliked) {
      newDislikes = dislikes - 1; // Remove the dislike
      newLikes = likes + 1; // Add a like
      newUserDisliked = false; // Mark as not disliked
      newUserLiked = true; // Mark as liked
      serverAction = "like";
    }
  }
  // If user clicks "Dislike"
  if (action === "dislike") {
    // User hasn't liked or disliked yet
    if (!userLiked && !userDisliked) {
      newDislikes = dislikes + 1; // Add a dislike
      newUserDisliked = true; // Mark as disliked
      serverAction = "dislike";
    }
    // User already disliked, so remove the dislike
    else if (!userLiked && userDisliked) {
      newDislikes = dislikes - 1; // Remove the dislike
      newUserDisliked = false; // Mark as not disliked
      serverAction = "undislike";
    }
    // User liked, so switch to dislike
    else if (userLiked && !userDisliked) {
      newLikes = likes - 1; // Remove the like
      newDislikes = dislikes + 1; // Add a dislike
      newUserLiked = false; // Mark as not liked
      newUserDisliked = true; // Mark as disliked
      serverAction = "dislike";
    }
  }

  // Update the UI right away
  setComments((prev) =>
    prev.map((c) =>
      c.id === commentId ? { ...c, likes: newLikes, dislikes: newDislikes } : c
    )
  );

  // Update if user liked or disliked
  setUserActions((prev) => ({
    ...prev,
    [commentId]: { liked: newUserLiked, disliked: newUserDisliked },
  }));

  // Send the action to the server
  try {
    await axios.post(
      `https://backendcrypto.onrender.com/api/comments/${commentId}/${serverAction}`,
      { user_id: uid },
      { withCredentials: true }
    );
    toast.success(`${action} done!`);
  } catch (error) {
    toast.error(`Could not ${action} comment`);
    fetchComments(); // Get fresh data if server fails
  }
};


  // Function to report a comment

  const handleReport = async (commentId) => {
    if (!uid) {
      toast.error("Please log in to report comments");
      return;
    }

    try {
      await axios.post(
        `https://backendcrypto.onrender.com/api/comments/reports`,
        { user_id: uid, commentId },
        { withCredentials: true }
      );

      // Increase the report count in the UI
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, reports: (comment.reports || 0) + 1 } : comment
        )
      );
      toast.success("Comment reported");
    } catch (error) {
      toast.error("Failed to report comment");
      fetchComments(); // Refresh comments if the server fails
    }
  };


  // Function to delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`https://backendcrypto.onrender.com/api/comments/${commentId}`, {
        data: { user_id: uid },
        withCredentials: true,
      });
      // Remove the comment from the UI
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
      fetchComments(); // Refresh comments if the server fails
    }
  };

  // Fetch comments when the component loads or 'symbol' changes
  useEffect(() => {
    fetchComments();
  }, [symbol]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Comments</h3>

      {loading ? (
        <div className="text-center text-gray-500">Loading comments...</div>
      ) : (
        <>
          {/* Input field to add a new comment */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800"
              rows="2"
            />
            <button
              onClick={handlePostComment}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-2 hover:bg-blue-600 transition duration-300 font-semibold"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </div>

          {/* List of comments */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                <div className="flex items-start space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${comment.username || "Anonymous"}&background=0D8ABC&color=fff`}
                    alt={comment.username || "Anonymous"}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-800">{comment.username || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1 text-gray-800 break-words">{comment.content}</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center space-x-4 text-sm">
                  {/* Like button */}
                  <button
                    onClick={() => handleAction(comment.id, "like")}
                    className={`flex items-center space-x-1 ${
                      userActions[comment.id]?.liked ? "text-blue-500" : "text-gray-500"
                    } hover:text-blue-600`}
                    disabled={userActions[comment.id]?.disliked} // Disable if disliked
                  >
                    <ThumbsUp size={16} />
                    <span>{comment.likes || 0}</span>
                  </button>

                  {/* Dislike button */}
                  <button
                    onClick={() => handleAction(comment.id, "dislike")}
                    className={`flex items-center space-x-1 ${
                      userActions[comment.id]?.disliked ? "text-red-500" : "text-gray-500"
                    } hover:text-red-600`}
                    disabled={userActions[comment.id]?.liked} // Disable if liked
                  >
                    <ThumbsDown size={16} />
                    <span>{comment.dislikes || 0}</span>
                  </button>

                  {/* Report button */}
                  <button
                    onClick={() => handleReport(comment.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Flag size={16} />
                  </button>

                  {/* Delete button (only for the user's own comment) */}
                  {uid === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentSection;