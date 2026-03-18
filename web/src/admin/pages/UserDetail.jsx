import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { endpoints, authHeader } from "../api";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [album, setAlbum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal gửi email
  const [showMailForm, setShowMailForm] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${endpoints.users}/${id}`, authHeader());
      setUser(res.data.user);
      setAlbum(res.data.album || []);
      setLoading(false);
    } catch (err) {
      console.error("AxiosError", err);
      setError("Failed to fetch user data");
      setLoading(false);
    }
  };

  const handleSendMail = async () => {
    if (!mailSubject.trim()) {
      alert("Please enter a subject");
      return;
    }
    if (!mailMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setSending(true);
      const res = await axios.post(
        `${endpoints.users}/${id}/send-mail`,
        {
          subject: mailSubject.trim(),
          message: mailMessage.trim(),
        },
        authHeader()
      );

      alert(res.data.message || "Email sent successfully!");
      setShowMailForm(false);
      setMailSubject("");
      setMailMessage("");
    } catch (err) {
      console.error("Send mail error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send email. Please try again.";
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;
  if (!user) return <p className="text-center py-10">No user found</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        User Detail - ID {id}
      </h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
          />

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-lg text-gray-600 mt-1">
              <strong>Email:</strong> {user.email}
            </p>

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-700 mb-2">Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Send Email Button */}
            <button
              onClick={() => setShowMailForm(true)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-green-700 transition transform hover:scale-105"
            >
              Send Email to User
            </button>
          </div>
        </div>
      </div>

      {/* Album Photos */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Album Photos</h3>

        {album.length === 0 ? (
          <p className="text-gray-500 italic">No photos available</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {album.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition">
                <img
                  src={photo.photo_url}
                  alt={`Photo ${photo.id}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Send Email */}
      {showMailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Send Email to {user.name}
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={mailMessage}
                  onChange={(e) => setMailMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows="7"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setShowMailForm(false);
                  setMailSubject("");
                  setMailMessage("");
                }}
                disabled={sending}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSendMail}
                disabled={sending}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;