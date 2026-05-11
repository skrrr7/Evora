import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import { formatDateTime } from "../lib/utils";

function parseMoney(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function resultBadgeClass(result) {
  if (result === "WIN")
    return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300";
  if (result === "LOSS")
    return "border-rose-400/50 bg-rose-500/15 text-rose-300";
  return "border-slate-500/50 bg-slate-500/15 text-slate-300";
}

const SessionDetailPage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [touched, setTouched] = useState({});

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

  const [startMoney, setStartMoney] = useState("");
  const [endMoney, setEndMoney] = useState("");

  useEffect(() => {
    if (!session) return;
    setStartMoney(String(session.startMoney ?? ""));
    setEndMoney(String(session.endMoney ?? ""));
  }, [session?._id, session?.startMoney, session?.endMoney]);

  const startNum = parseMoney(startMoney);
  const endNum = parseMoney(endMoney);
  const moneyPreviewReady = startNum !== null && endNum !== null;

  const analytics = useMemo(() => {
    if (!session) return null;
    const s = Number(session.startMoney);
    const e = Number(session.endMoney);
    const hasMoney = Number.isFinite(s) && Number.isFinite(e);
    if (!hasMoney) {
      const r = session.result;
      return {
        hasMoney: false,
        start: null,
        end: null,
        profit: null,
        result: r && ["WIN", "LOSS", "DRAW"].includes(r) ? r : null,
      };
    }
    const profit = e - s;
    const result = profit > 0 ? "WIN" : profit < 0 ? "LOSS" : "DRAW";
    return { hasMoney: true, start: s, end: e, profit, result };
  }, [session]);

  const profit = useMemo(() => {
    if (!moneyPreviewReady) return null;
    return endNum - startNum;
  }, [moneyPreviewReady, endNum, startNum]);

  const resultPreview = useMemo(() => {
    if (profit === null) return null;
    if (profit > 0) return "WIN";
    if (profit < 0) return "LOSS";
    return "DRAW";
  }, [profit]);

  const errors = useMemo(() => {
    if (!session) return {};
    const e = {};
    if (touched.title && !session.title?.trim()) e.title = "Title is required";
    if (touched.game && !session.game?.trim()) e.game = "Game is required";
    if (touched.startMoney) {
      if (startMoney === "") e.startMoney = "Start money is required";
      else if (startNum === null) e.startMoney = "Enter a valid number";
    }
    if (touched.endMoney) {
      if (endMoney === "") e.endMoney = "End money is required";
      else if (endNum === null) e.endMoney = "Enter a valid number";
    }
    return e;
  }, [touched, session, startMoney, endMoney, startNum, endNum]);

  const isValid =
    session &&
    session.title?.trim() &&
    session.game?.trim() &&
    startNum !== null &&
    endNum !== null &&
    startMoney !== "" &&
    endMoney !== "";

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;

    try {
      await api.delete(`/session/${id}`);
      toast.success("Session deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the session:", error);
      toast.error("Failed to delete session");
    }
  };

  const resetEditForm = () => {
    if (!session) return;
    setStartMoney(String(session.startMoney ?? ""));
    setEndMoney(String(session.endMoney ?? ""));
    setTouched({});
  };

  const handleCancelEdit = async () => {
    setEditOpen(false);
    setTouched({});
    try {
      const res = await api.get(`/session/${id}`);
      setSession(res.data);
      setStartMoney(String(res.data.startMoney ?? ""));
      setEndMoney(String(res.data.endMoney ?? ""));
    } catch (e) {
      console.log(e);
      resetEditForm();
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setTouched({ title: true, game: true, startMoney: true, endMoney: true });

    if (!isValid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);

    try {
      const res = await api.put(`/session/${id}`, {
        title: session.title.trim(),
        game: session.game.trim(),
        startMoney: startNum,
        endMoney: endNum,
        notes: (session.notes ?? "").trim(),
      });
      setSession(res.data);
      toast.success("Session updated");
      setEditOpen(false);
      resetEditForm();
    } catch (error) {
      console.log("Error saving the session:", error);
      toast.error("Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  const resultBadgeClassForm =
    resultPreview === "WIN"
      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
      : resultPreview === "LOSS"
        ? "border-rose-400/50 bg-rose-500/15 text-rose-300"
        : resultPreview === "DRAW"
          ? "border-slate-500/50 bg-slate-500/15 text-slate-300"
          : "";

  if (loading) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 font-sans">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(139,92,246,0.2),transparent_50%)]" />
        <LoaderIcon className="size-10 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-7xl p-4 pt-24 text-center text-slate-400">Session not found.</div>
      </div>
    );
  }

  const created = new Date(session.createdAt);
  const displayResult = analytics?.result;
  const notesBody =
    (session.notes && session.notes.trim()) ||
    (typeof session.content === "string" && session.content.trim()) ||
    "No notes.";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(139,92,246,0.22),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_60%,rgba(34,211,238,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-slate-950" />

      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (editOpen) {
                  void handleCancelEdit();
                } else {
                  resetEditForm();
                  setEditOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-400/30 hover:bg-violet-500/10"
            >
              <PencilIcon className="size-4" />
              {editOpen ? "Close" : "Edit"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/15"
            >
              <Trash2Icon className="size-4" />
              Delete
            </button>
          </div>
        </div>

        <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {session.title || "Untitled"}
              </h1>
              <p className="mt-1 text-sm text-violet-200/80">{session.game?.trim() || "—"}</p>
              <p className="mt-3 text-xs text-slate-500">{formatDateTime(created)}</p>
            </div>
            {displayResult && (
              <span
                className={`inline-flex shrink-0 self-start rounded-xl border px-4 py-2 text-sm font-bold tracking-wide ${resultBadgeClass(displayResult)}`}
              >
                {displayResult}
              </span>
            )}
          </div>

          {analytics?.hasMoney && (
            <div className="border-b border-white/10 py-6">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Bankroll</p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
                <span className="text-slate-400">
                  Start{" "}
                  <span className="ml-1 font-semibold tabular-nums text-white">{formatMoney(analytics.start)}</span>
                </span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-400">
                  End{" "}
                  <span className="ml-1 font-semibold tabular-nums text-white">{formatMoney(analytics.end)}</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  Profit{" "}
                  <span
                    className={`ml-1 font-semibold tabular-nums ${
                      analytics.profit > 0
                        ? "text-emerald-300"
                        : analytics.profit < 0
                          ? "text-rose-300"
                          : "text-slate-200"
                    }`}
                  >
                    {analytics.profit >= 0 ? "+" : ""}
                    {formatMoney(analytics.profit)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {!analytics?.hasMoney && (
            <p className="border-b border-white/10 py-5 text-sm text-slate-500">No start or end balance recorded.</p>
          )}

          <div className="pt-6">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{notesBody}</p>
          </div>
        </article>

        {editOpen && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="text-lg font-semibold text-white">Edit</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Title
                </label>
                <input
                  type="text"
                  className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/30 ${
                    errors.title ? "border-rose-500/50" : "border-white/10"
                  }`}
                  value={session.title}
                  onBlur={() => markTouched("title")}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                />
                {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Game</label>
                <input
                  type="text"
                  className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/25 ${
                    errors.game ? "border-rose-500/50" : "border-white/10"
                  }`}
                  value={session.game ?? ""}
                  onBlur={() => markTouched("game")}
                  onChange={(e) => setSession({ ...session, game: e.target.value })}
                />
                {errors.game && <p className="mt-1 text-xs text-rose-400">{errors.game}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Start
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.startMoney ? "border-rose-500/50" : "border-white/10"
                    }`}
                    value={startMoney}
                    onBlur={() => markTouched("startMoney")}
                    onChange={(e) => setStartMoney(e.target.value)}
                  />
                  {errors.startMoney && <p className="mt-1 text-xs text-rose-400">{errors.startMoney}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">End</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className={`w-full rounded-xl border bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.endMoney ? "border-rose-500/50" : "border-white/10"
                    }`}
                    value={endMoney}
                    onBlur={() => markTouched("endMoney")}
                    onChange={(e) => setEndMoney(e.target.value)}
                  />
                  {errors.endMoney && <p className="mt-1 text-xs text-rose-400">{errors.endMoney}</p>}
                </div>
              </div>

              {moneyPreviewReady && (
                <p className="text-sm text-slate-400">
                  Preview:{" "}
                  <span className="font-semibold tabular-nums text-white">
                    {profit >= 0 ? "+" : ""}
                    {formatMoney(profit)}
                  </span>
                  {resultPreview && (
                    <span className={`ml-2 inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${resultBadgeClassForm}`}>
                      {resultPreview}
                    </span>
                  )}
                </p>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">Notes</label>
                <textarea
                  rows={4}
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={session.notes ?? ""}
                  onChange={(e) => setSession({ ...session, notes: e.target.value })}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SessionDetailPage;
