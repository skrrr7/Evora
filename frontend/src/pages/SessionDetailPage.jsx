import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const SessionDetailPage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/session/${id}`);
        setSession(res.data);
      } catch (error) {
        console.log("Error in fetching Session", error);
        toast.error("Failed to fetch the session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await api.delete(`/session/${id}`);
      toast.success("session deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the session:", error);
      toast.error("Failed to delete session");
    }
  };

  const handleSave = async () => {
    if (!session.title.trim() || !session.content.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/session/${id}`, session);
      toast.success("session updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the session:", error);
      toast.error("Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Session
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Delete Session
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Session title"
                  className="input input-bordered"
                  value={session.title}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content</span>
                </label>
                <textarea
                  placeholder="Write your session here..."
                  className="textarea textarea-bordered h-32"
                  value={session.content}
                  onChange={(e) => setSession({ ...session, content: e.target.value })}
                />
              </div>

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SessionDetailPage;