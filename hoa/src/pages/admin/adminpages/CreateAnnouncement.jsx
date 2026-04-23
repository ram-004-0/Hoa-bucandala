import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
const CreateAnnouncement = () => {
  const [category, setCategory] = useState("Policy");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  const handlePost = async () => {
    setError("");
    setSuccess("");

    if (!title || !content) {
      setError("Title and Content are required");
      return;
    }

    try {
      const res = await fetch(
        "https://hoa-camellabucandalav-production.up.railway.app/api/announcements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            category,
            title,
            content,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post announcement");
      }

      setSuccess("Announcement posted successfully!");
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      const res = await fetch(
        `https://hoa-camellabucandalav-production.up.railway.app/api/announcements/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Announcement deleted");
      fetchAnnouncements(); // refresh list
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const res = await fetch(
      "https://hoa-camellabucandalav-production.up.railway.app/api/announcements",
    );
    const data = await res.json();
    setAnnouncements(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Create Announcement</h1>
      </div>

      <div className="m-10 flex flex-col gap-6 items-center">
        <div className="w-full max-w-4xl p-6 shadow-md rounded-lg bg-white flex flex-col gap-4">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold">
              Category <span className="text-red-700">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg w-full p-2"
            >
              <option value="Policy">Policy</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Events">Events</option>
              <option value="Events">Meeting</option>
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold">
              Title <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add Title"
              className="w-full rounded-lg border p-2"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold">
              Content <span className="text-red-700">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-lg border p-2 h-60 resize-none"
              placeholder="Add description"
            />
          </div>

          {/* Error / Success */}
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          {/* Post Button */}
          <button
            onClick={handlePost}
            className="bg-[#00704e] rounded-lg px-6 py-2 text-white w-max hover:bg-[#005a3e] transition-colors"
          >
            Post Announcement
          </button>
        </div>

        {/* Note */}
        <div className="rounded-lg bg-blue-100 p-4 w-full max-w-4xl border border-blue-200">
          <p>
            <span className="font-semibold">Note: </span>
            This announcement will be visible to all residents immediately after
            posting. Make sure all information is accurate before submitting.
          </p>
        </div>
        <div className="w-full max-w-4xl bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Announcements</h2>

          {announcements.length === 0 && (
            <p className="text-gray-500">No announcements found</p>
          )}

          {announcements.map((a) => (
            <div
              key={a.id}
              className="flex justify-between items-center border-b py-3"
            >
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-500">{a.category}</p>
              </div>

              <button
                onClick={() => handleDelete(a.id)}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
