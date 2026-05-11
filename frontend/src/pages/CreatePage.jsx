import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";
import { ArrowLeftIcon } from "lucide-react";
import Navbar from "../components/Navbar";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!title.trim() || !content.trim()){
      toast.error("All fields are required")
      return;
    }

    setLoading(true)
    try {
      await api.post("/session", {
        title,
        content
      })
      toast.success("Session created successfully!")
      navigate("/")
    } catch (error) {
      console.log("Error creating session",error);
      toast.error("Failed to create session!");

    }finally{
      setLoading(false)
    }
  };


  return(
   <div className="relative isolate min-h-screen overflow-hidden bg-slate-950">
    <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(120%_120%_at_50%_0%,#111827_35%,#020617_100%)]" />
    <Navbar />
    <div className="max-w-7xl mx-auto p-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <Link
          to={"/"}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
        >
          <ArrowLeftIcon className="size-5" />
          Back to Session
        </Link>

        <div className="rounded-2xl border border-blue-300/20 bg-blue-900/70 text-slate-100 backdrop-blur-sm">
          <div className="p-6 md:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-slate-100">Create New Session</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Title</label>
                <input
                  type="text"
                  placeholder="Session Title"
                  className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-cyan-300"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-200">Content</label>
                <textarea
                  placeholder="Write your session here..."
                  className="h-40 w-full rounded-lg border border-white/15 bg-slate-950/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-cyan-300"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  );
};

export default CreatePage