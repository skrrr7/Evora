import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import React from "react";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

function resultBadgeClass(result) {
  if (result === "WIN") return "border-emerald-400/40 bg-emerald-500/15 text-emerald-300";
  if (result === "LOSS") return "border-rose-400/40 bg-rose-500/15 text-rose-300";
  return "border-slate-500/40 bg-slate-500/15 text-slate-300";
}

const SessionCard = ({ session, setSession }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault();

    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await api.delete(`/session/${id}`);
      setSession((prev) => prev.filter((s) => s._id !== id));
      toast.success("Session deleted");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete session");
    }
  };

  const hasMoney =
    session.startMoney !== undefined &&
    session.endMoney !== undefined &&
    !Number.isNaN(Number(session.startMoney)) &&
    !Number.isNaN(Number(session.endMoney));
  const profit = hasMoney ? Number(session.endMoney) - Number(session.startMoney) : null;
  const result =
    profit === null
      ? session.result && ["WIN", "LOSS", "DRAW"].includes(session.result)
        ? session.result
        : "—"
      : profit > 0
        ? "WIN"
        : profit < 0
          ? "LOSS"
          : "DRAW";

  return (
    <Link
      to={`/session/${session._id}`}
      className="card group rounded-2xl border border-white/10 border-t-violet-500/80 bg-white/[0.06] text-slate-100 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.25)]"
    >
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-lg font-semibold tracking-tight text-white">{session.title}</h3>
          {result !== "—" && (
            <span
              className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide ${resultBadgeClass(result)}`}
            >
              {result}
            </span>
          )}
        </div>
        {session.game && <p className="text-sm font-medium text-violet-200/90">{session.game}</p>}
        <p className="line-clamp-2 text-sm text-slate-300">
          {session.notes?.trim()
            ? session.notes
            : hasMoney
              ? `Start ${session.startMoney} → End ${session.endMoney}`
              : session.content ?? "No details"}
        </p>
        <div className="card-actions mt-1 flex items-center justify-between gap-2">
          {profit !== null && (
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90">
              {profit >= 0 ? "+" : ""}
              {profit}
            </span>
          )}
          <span className="text-sm font-medium text-slate-400">{formatDate(new Date(session.createdAt))}</span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4 text-cyan-300 opacity-70 transition-opacity group-hover:opacity-100" />
            <button
              className="btn btn-ghost btn-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              onClick={(e) => handleDelete(e, session._id)}
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;
