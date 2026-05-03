import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import React from "react";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";


const SessionCard = ({session,setSession}) => {

  const handleDelete = async(e,id) => {
    e.preventDefault(); //get rid of navigation

    if(!window.confirm("Are you sure you want to delete this note?")) return;

    try {
        await api.delete(`/session/${id}`);
        setSession((prev) => prev.filter(session => session._id !== id))
        toast.success("Session deleted");
    } catch (error) {
        console.log("Error in handleDelete",error);
        toast.error("Failed to delete session");
    }
  }
  return (
  <Link
    to={`/session/${session._id}`}
    className="card border border-blue-300/20 border-t-4 border-t-cyan-400 bg-blue-900/70 text-slate-100 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-slate-950/40"
  >
    <div className="card-body">
        <h3 className="card-title font-semibold text-slate-100">{session.title}</h3>
        <p className="line-clamp-3 font-medium text-slate-200">{session.content}</p>
        <div className="card-actions justify-between items-center mt-4">
            <span className="text-sm font-medium text-slate-300">
                {formatDate(new Date(session.createdAt))}
            </span>
            <div className="flex items-center gap-1">
                    <PenSquareIcon className="size-4 text-cyan-300"/>
                <button className="btn btn-ghost btn-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" onClick={(e) => handleDelete(e,session._id)}>
                    <Trash2Icon className="size-4" />
                </button>

            </div>
        </div>
    </div>

  </Link>
  )
};

export default SessionCard