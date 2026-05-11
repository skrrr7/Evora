import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import Navbar from "../components/Navbar";

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
      <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(120%_120%_at_50%_0%,#111827_35%,#020617_100%)]" />
        <LoaderIcon className="animate-spin size-10 text-cyan-300" />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(120%_120%_at_50%_0%,#111827_35%,#020617_100%)]" />
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Session
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
            >
              <Trash2Icon className="h-5 w-5" />
              Delete Session
            </button>
          </div>

          <div className="rounded-2xl border border-blue-300/20 bg-blue-900/70 text-slate-100 backdrop-blur-sm">
            <div className="p-6 md:p-8">
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Title</label>
                <input
                  type="text"
                  placeholder="Session title"
                  className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-cyan-300"
                  value={session.title}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Content</label>
                <textarea
                  placeholder="Write your session here..."
                  className="h-40 w-full rounded-lg border border-white/15 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-cyan-300"
                  value={session.content}
                  onChange={(e) => setSession({ ...session, content: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <button
                  className="inline-flex items-center rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={saving}
                  onClick={handleSave}
                >
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