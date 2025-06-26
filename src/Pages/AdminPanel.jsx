import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import { toast } from "react-hot-toast";
import { Lock, Unlock, Flag, RefreshCw } from "lucide-react";

const AdminPanel = () => {
  const { email } = useUser(); // Only need email for admin check
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hardcoded list of admin emails
  const adminEmails = ["sharmayatin0882@gmail.com", "admin2@example.com"];
  const isAdmin = adminEmails.includes(email);

  // Fetch reported comments with reporters
  const fetchReportedComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://backendcrypto.onrender.com/api/comments/reported", {
        withCredentials: true,
      });
      console.log("Fetched reported comments:", response.data);
      setReportedComments(Array.isArray(response.data) ? response.data : []);
      toast.success("Reported comments loaded successfully!");
    } catch (error) {
      console.error("Error fetching reported comments:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to fetch reported comments.");
      setReportedComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle block status for a reporter
  const handleBlockUser = async (userId, isBlocked) => {
    if (!userId) {
      toast.error("Invalid user ID.");
      return;
    }
    console.log(`Attempting to ${isBlocked ? "unblock" : "block"} user:`, { userId, admin_email: email });
    try {
      const endpoint = isBlocked
        ? `https://backendcrypto.onrender.com/api/users/${userId}/unblock`
        : `https://backendcrypto.onrender.com/api/users/${userId}/block`;
      const response = await axios.put(
        endpoint,
        { admin_email: email },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      console.log("Block/Unblock response:", response.data);
      toast.success(response.data.message || `User ${isBlocked ? "unblocked" : "blocked"} successfully!`);
      // Fetch updated data after blocking/unblocking
      fetchReportedComments();
    } catch (error) {
      console.error("Error toggling block status:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to toggle block status.");
    }
  };

  // Refresh data manually
  const handleRefresh = () => {
    fetchReportedComments();
  };

  useEffect(() => {
    if (isAdmin) {
      fetchReportedComments();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-xl rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Reported Comments</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : reportedComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reported comments found.</p>
        ) : (
          <div className="space-y-6">
            {reportedComments.map((comment) => (
              <div
                key={comment.id || Math.random()}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start space-x-3">
                  <Flag size={20} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {comment.commenter_username || "Anonymous"} (ID: {comment.commenter_id ? comment.commenter_id.slice(0, 8) + "..." : "N/A"})
                    </p>
                    <p className="mt-1 text-gray-700 break-words">{comment.content || "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reported <span className="font-medium text-red-600">{comment.reports || 0}</span> time(s) on{" "}
                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : "N/A"}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Reported by:</p>
                      {comment.reporters.length > 0 ? (
                        <ul className="mt-1 space-y-2">
                          {comment.reporters.map((reporter) => (
                            <li key={reporter.id} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
                              <span className="text-gray-800">
                                {reporter.username} (ID: {reporter.id.slice(0, 8)}...)
                              </span>
                              {/* Fetch is_blocked status for each reporter dynamically if needed */}
                              <button
                                onClick={() => handleBlockUser(reporter.id, false)} // Assuming initial state; adjust if is_blocked is available
                                className="text-red-500 hover:text-red-700 transition"
                                title="Block Reporter"
                              >
                                <Lock size={18} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No reporters found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;