import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  LoaderIcon,
  MinusIcon,
  PencilIcon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
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
    return "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]";
  if (result === "LOSS")
    return "border-rose-400/50 bg-rose-500/15 text-rose-300 shadow-[0_0_24px_-4px_rgba(251,113,133,0.4)]";
  return "border-slate-500/50 bg-slate-500/15 text-slate-300";
}

function StatCard({ label, children, highlight, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-inner shadow-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-white/15 ${highlight ? "border-violet-400/35 bg-gradient-to-br from-violet-500/15 via-white/[0.04] to-cyan-500/10 ring-1 ring-violet-500/25" : ""} ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
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
        maxBar: 1,
      };
    }
    // Always derive from amounts: stored `profit` can be wrong (e.g. 0) because `??` treats 0 as set,
    // and DB updates may skip Mongoose `pre('save')` so `profit`/`result` can be stale.
    const profit = e - s;
    const result = profit > 0 ? "WIN" : profit < 0 ? "LOSS" : "DRAW";
    const maxBar = Math.max(s, e, 1);
    return { hasMoney: true, start: s, end: e, profit, result, maxBar };
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
      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]"
      : resultPreview === "LOSS"
        ? "border-rose-400/50 bg-rose-500/15 text-rose-300 shadow-[0_0_24px_-4px_rgba(251,113,133,0.4)]"
        : resultPreview === "DRAW"
          ? "border-slate-500/50 bg-slate-500/15 text-slate-300"
          : "";

  const pctChange =
    analytics?.hasMoney && analytics.start !== 0
      ? ((analytics.end - analytics.start) / Math.abs(analytics.start)) * 100
      : null;

  if (loading) {
    return (
      <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 font-sans">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.12),transparent_50%)]" />
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
    (session.notes && session.notes.trim()) || (typeof session.content === "string" && session.content.trim()) || "No notes for this session.";
  const gameLabel = session.game?.trim() || "—";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.12),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(167,139,250,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.92))]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)]"
          >
            <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to sessions
          </Link>
          <div className="flex flex-wrap items-center gap-3">
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
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-all duration-300 hover:border-violet-400/50 hover:bg-violet-500/20"
            >
              <PencilIcon className="size-4" />
              {editOpen ? "Close editor" : "Edit session"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-all duration-300 hover:bg-rose-500/20"
            >
              <Trash2Icon className="size-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Report header */}
        <header className="mb-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_48px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {session.title || "Untitled session"}
              </h1>
              <p className="mt-3 text-lg font-medium text-violet-200/90">{gameLabel}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-cyan-400/80" aria-hidden />
                  {formatDateTime(created)}
                </span>
              </p>
            </div>
            {displayResult && (
              <span
                className={`inline-flex shrink-0 items-center justify-center self-start rounded-2xl border px-6 py-3 text-lg font-bold tracking-wide ${resultBadgeClass(displayResult)}`}
              >
                {displayResult}
              </span>
            )}
          </div>
        </header>

        {/* Key stats */}
        <section className="mb-10" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">
            Key statistics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Start money">
              <p className="text-2xl font-bold tabular-nums text-white">
                {analytics?.hasMoney ? formatMoney(analytics.start) : "—"}
              </p>
            </StatCard>
            <StatCard label="End money">
              <p className="text-2xl font-bold tabular-nums text-white">
                {analytics?.hasMoney ? formatMoney(analytics.end) : "—"}
              </p>
            </StatCard>
            <StatCard label="Profit" highlight>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  analytics?.profit == null
                    ? "text-slate-400"
                    : analytics.profit > 0
                      ? "text-emerald-300"
                      : analytics.profit < 0
                        ? "text-rose-300"
                        : "text-slate-200"
                }`}
              >
                {analytics?.hasMoney
                  ? `${analytics.profit >= 0 ? "+" : ""}${formatMoney(analytics.profit)}`
                  : "—"}
              </p>
              {analytics?.hasMoney && (
                <p className="mt-1 text-xs text-slate-500">End balance minus start balance</p>
              )}
            </StatCard>
            <StatCard label="Result">
              {displayResult ? (
                <span
                  className={`inline-flex rounded-xl border px-4 py-2 text-sm font-bold tracking-wide ${resultBadgeClass(displayResult)}`}
                >
                  {displayResult}
                </span>
              ) : (
                <p className="text-lg font-semibold text-slate-500">—</p>
              )}
            </StatCard>
          </div>
        </section>

        {/* Visualization + trend */}
        {analytics?.hasMoney && (
          <section className="mb-10 grid gap-6 lg:grid-cols-3" aria-labelledby="viz-heading">
            <h2 id="viz-heading" className="sr-only">
              Performance visualization
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Bankroll comparison
              </h3>
              <p className="mt-1 text-xs text-slate-500">Start vs end balance (same scale)</p>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-violet-200">Start</span>
                    <span className="tabular-nums text-slate-300">{formatMoney(analytics.start)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
                      style={{ width: `${(analytics.start / analytics.maxBar) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-cyan-200">End</span>
                    <span className="tabular-nums text-slate-300">{formatMoney(analytics.end)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-900/80 ring-1 ring-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${(analytics.end / analytics.maxBar) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 backdrop-blur-xl ${
                analytics.profit > 0
                  ? "border-emerald-400/30 bg-emerald-500/[0.08]"
                  : analytics.profit < 0
                    ? "border-rose-400/30 bg-rose-500/[0.08]"
                    : "border-slate-500/30 bg-slate-500/[0.06]"
              }`}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Session trend</h3>
              <div className="mt-4 flex items-start gap-3">
                {analytics.profit > 0 && (
                  <TrendingUpIcon className="size-8 shrink-0 text-emerald-400" aria-hidden />
                )}
                {analytics.profit < 0 && (
                  <TrendingDownIcon className="size-8 shrink-0 text-rose-400" aria-hidden />
                )}
                {analytics.profit === 0 && (
                  <MinusIcon className="size-8 shrink-0 text-slate-400" aria-hidden />
                )}
                <div>
                  <p className="text-lg font-bold text-white">
                    {analytics.profit > 0 && "Bankroll up"}
                    {analytics.profit < 0 && "Bankroll down"}
                    {analytics.profit === 0 && "Flat session"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Net change of{" "}
                    <span className="font-semibold tabular-nums text-white">
                      {analytics.profit >= 0 ? "+" : ""}
                      {formatMoney(analytics.profit)}
                    </span>
                    {pctChange != null && Number.isFinite(pctChange) && (
                      <>
                        {" "}
                        <span className="text-slate-500">·</span>{" "}
                        <span className="font-semibold tabular-nums text-white">
                          {pctChange >= 0 ? "+" : ""}
                          {pctChange.toFixed(1)}%
                        </span>{" "}
                        <span className="text-slate-500">vs start</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {!analytics?.hasMoney && (
          <div className="mb-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-slate-400 backdrop-blur-sm">
            No start/end money on this session — add amounts when editing to unlock charts and profit analytics.
          </div>
        )}

        {/* Breakdown */}
        <section
          className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_48px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8"
          aria-labelledby="breakdown-heading"
        >
          <h2 id="breakdown-heading" className="text-lg font-bold text-white">
            Session breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-400">Full record for this entry</p>
          <dl className="mt-8 divide-y divide-white/10">
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Title</dt>
              <dd className="text-slate-100 sm:col-span-2">{session.title || "—"}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Game</dt>
              <dd className="text-slate-100 sm:col-span-2">{gameLabel}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Timestamp</dt>
              <dd className="font-mono text-sm text-cyan-200/90 sm:col-span-2">{formatDateTime(created)}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</dt>
              <dd className="whitespace-pre-wrap text-slate-200 sm:col-span-2">{notesBody}</dd>
            </div>
          </dl>
        </section>

        {/* Collapsible editor */}
        {editOpen && (
          <section className="mt-10 rounded-2xl border border-violet-400/25 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="text-xl font-bold text-white">Edit session</h2>
            <p className="mt-1 text-sm text-slate-400">Update fields — analytics refresh after save.</p>
            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Title</label>
                <input
                  type="text"
                  placeholder="Session title"
                  className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/30 ${
                    errors.title ? "border-rose-500/50" : "border-white/10 hover:border-violet-400/25"
                  }`}
                  value={session.title}
                  onBlur={() => markTouched("title")}
                  onChange={(e) => setSession({ ...session, title: e.target.value })}
                />
                {errors.title && <p className="mt-1.5 text-sm text-rose-400">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Game</label>
                <input
                  type="text"
                  className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/25 ${
                    errors.game ? "border-rose-500/50" : "border-white/10 hover:border-cyan-400/25"
                  }`}
                  value={session.game ?? ""}
                  onBlur={() => markTouched("game")}
                  onChange={(e) => setSession({ ...session, game: e.target.value })}
                />
                {errors.game && <p className="mt-1.5 text-sm text-rose-400">{errors.game}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Start money</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.startMoney ? "border-rose-500/50" : "border-white/10"
                    }`}
                    value={startMoney}
                    onBlur={() => markTouched("startMoney")}
                    onChange={(e) => setStartMoney(e.target.value)}
                  />
                  {errors.startMoney && (
                    <p className="mt-1.5 text-sm text-rose-400">{errors.startMoney}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">End money</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.endMoney ? "border-rose-500/50" : "border-white/10"
                    }`}
                    value={endMoney}
                    onBlur={() => markTouched("endMoney")}
                    onChange={(e) => setEndMoney(e.target.value)}
                  />
                  {errors.endMoney && <p className="mt-1.5 text-sm text-rose-400">{errors.endMoney}</p>}
                </div>
              </div>

              {moneyPreviewReady && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profit preview</p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-white">
                        {profit >= 0 ? "+" : ""}
                        {formatMoney(profit)}
                      </p>
                      <p className="text-xs text-slate-500">End − Start</p>
                    </div>
                    {resultPreview && (
                      <span
                        className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold tracking-wide ${resultBadgeClassForm}`}
                      >
                        {resultPreview}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Notes</label>
                <textarea
                  rows={4}
                  placeholder="Notes…"
                  className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  value={session.notes ?? ""}
                  onChange={(e) => setSession({ ...session, notes: e.target.value })}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-white/25 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving…" : "Save changes"}
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
