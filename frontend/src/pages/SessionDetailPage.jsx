import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  LoaderIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Navbar from "../components/Navbar";

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

function formatSessionSubtitleDate(date) {
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Relative to buy-in (start), 0–100 for progress bar / stat card */
function sessionOutcomePercent(start, profit) {
  if (!Number.isFinite(start) || start <= 0 || !Number.isFinite(profit)) return null;
  return Math.min(100, Math.round((Math.abs(profit) / start) * 100));
}

/** Matches dashboard session badges (HomePage `resultStyles`) */
function resultBadgeStyles(result) {
  if (result === "WIN") return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20";
  if (result === "LOSS") return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20";
  if (result === "DRAW") return "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20";
  return "bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700";
}

const SessionDetailPage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [touched, setTouched] = useState({});
  const editSectionRef = useRef(null);

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

  useEffect(() => {
    if (!editOpen || !editSectionRef.current) return;
    editSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editOpen]);

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
  const notesTrimmed =
    (session.notes && session.notes.trim()) ||
    (typeof session.content === "string" && session.content.trim()) ||
    "";
  const hasNotes = Boolean(notesTrimmed);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(139,92,246,0.22),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_60%,rgba(34,211,238,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-slate-950" />

      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-24 sm:px-6">
        <div className="mb-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeftIcon className="size-4 transition group-hover:-translate-x-0.5" aria-hidden />
            Back
          </Link>
        </div>

        <article className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-900/20 shadow-lg shadow-black/20">
          <div className="p-6 sm:p-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1 space-y-1.5">
                <h1 className="text-balance text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
                  {session.title || "Untitled"}
                </h1>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-zinc-500">
                  <span className="text-zinc-300">{session.game?.trim() || "Game not set"}</span>
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <time
                    className="text-zinc-500"
                    dateTime={Number.isFinite(created.getTime()) ? created.toISOString() : undefined}
                  >
                    {formatSessionSubtitleDate(created)}
                  </time>
                </p>
              </div>
              {analytics?.hasMoney && displayResult && (
                <div className="flex shrink-0 flex-col items-start sm:items-end">
                  <p
                    className={`text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl ${
                      analytics.profit > 0
                        ? "text-emerald-400"
                        : analytics.profit < 0
                          ? "text-rose-400"
                          : "text-zinc-300"
                    }`}
                  >
                    {analytics.profit > 0 ? "+" : ""}
                    {formatMoney(analytics.profit)}
                  </p>
                  <span
                    className={`mt-1.5 inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${resultBadgeStyles(displayResult)}`}
                  >
                    {displayResult}
                  </span>
                </div>
              )}
              {!analytics?.hasMoney && displayResult && (
                <div className="flex shrink-0 flex-col items-start sm:items-end">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${resultBadgeStyles(displayResult)}`}
                  >
                    {displayResult}
                  </span>
                </div>
              )}
            </header>

            {analytics?.hasMoney && (
              <section className="mt-8 space-y-6" aria-labelledby="session-summary-heading">
                <h2 id="session-summary-heading" className="sr-only">
                  Session summary
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-4 py-3.5 sm:py-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Buy-in</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-50 sm:text-xl">
                      {formatMoney(analytics.start)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-4 py-3.5 sm:py-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Cash-out</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-50 sm:text-xl">
                      {formatMoney(analytics.end)}
                    </p>
                  </div>
                  {(() => {
                    const pct = sessionOutcomePercent(analytics.start, analytics.profit);
                    const isLoss = analytics.profit < 0;
                    const isWin = analytics.profit > 0;
                    const label = isLoss ? "Loss %" : isWin ? "Win %" : "Net %";
                    const displayPct = pct === null ? "—" : `${pct}%`;
                    return (
                      <div
                        className={`rounded-lg border px-4 py-3.5 ring-1 sm:py-4 ${
                          isLoss
                            ? "border-rose-500/20 bg-rose-500/10 ring-rose-500/15"
                            : isWin
                              ? "border-emerald-500/20 bg-emerald-500/10 ring-emerald-500/15"
                              : "border-zinc-800/80 bg-zinc-900/40 ring-zinc-700/50"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-medium uppercase tracking-wider ${
                            isLoss ? "text-rose-400/90" : isWin ? "text-emerald-400/90" : "text-zinc-500"
                          }`}
                        >
                          {label}
                        </p>
                        <p
                          className={`mt-1 text-lg font-semibold tabular-nums sm:text-xl ${
                            isLoss ? "text-rose-400" : isWin ? "text-emerald-400" : "text-zinc-300"
                          }`}
                        >
                          {displayPct}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const pct = sessionOutcomePercent(analytics.start, analytics.profit);
                  const barPct = pct === null ? 0 : pct;
                  const isLoss = analytics.profit < 0;
                  const isWin = analytics.profit > 0;
                  const fillClass = isLoss ? "bg-rose-500/80" : isWin ? "bg-emerald-500/80" : "bg-zinc-500";
                  return (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm text-zinc-500">
                        <span>Session progress</span>
                        <span className="inline-flex items-center gap-1 tabular-nums text-zinc-400">
                          {isLoss && <ArrowDownIcon className="size-3.5 shrink-0" aria-hidden />}
                          {isWin && <ArrowUpIcon className="size-3.5 shrink-0" aria-hidden />}
                          {pct === null ? "—" : `${pct}%`}
                        </span>
                      </div>
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800"
                        role="progressbar"
                        aria-valuenow={barPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Session outcome versus buy-in"
                      >
                        <div
                          className={`h-full rounded-full transition-[width] duration-500 ease-out ${fillClass}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {!analytics?.hasMoney && (
              <div className="mt-8 rounded-lg border border-dashed border-zinc-800/80 bg-zinc-900/30 px-4 py-8 text-center">
                <p className="text-sm text-zinc-500">No start or end balance on this session.</p>
                <p className="mt-1 text-xs text-zinc-600">Edit the session to add bankroll numbers.</p>
              </div>
            )}

            <footer className="mt-8 flex flex-col gap-4 border-t border-zinc-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                {hasNotes ? (
                  <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{notesTrimmed}</p>
                ) : (
                  <p className="text-sm italic text-zinc-600">No notes added</p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-end">
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
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/15 hover:bg-white/[0.08]"
                >
                  <PencilIcon className="size-4 shrink-0 opacity-80" aria-hidden />
                  {editOpen ? "Close editor" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="Delete this session"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-transparent px-3.5 py-2 text-sm font-medium text-zinc-400 transition hover:border-rose-500/40 hover:bg-rose-500/[0.08] hover:text-rose-200"
                >
                  <Trash2Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  Delete
                </button>
              </div>
            </footer>
          </div>
        </article>

        {editOpen && (
          <section
            ref={editSectionRef}
            id="session-edit"
            className="mt-6 scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-lg shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-xl sm:p-7"
          >
            <h2 className="text-base font-semibold tracking-tight text-white">Edit session</h2>
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
