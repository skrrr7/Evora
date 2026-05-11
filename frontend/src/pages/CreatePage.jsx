import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";
import { ArrowLeftIcon } from "lucide-react";
import Navbar from "../components/Navbar";

const GAME_SUGGESTIONS = [
  "Poker",
  "Blackjack",
  "Slots",
  "Roulette",
  "Baccarat",
  "Craps",
  "Sports betting",
  "Other",
];

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

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [startMoney, setStartMoney] = useState("");
  const [endMoney, setEndMoney] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();

  const startNum = parseMoney(startMoney);
  const endNum = parseMoney(endMoney);
  const moneyPreviewReady = startNum !== null && endNum !== null;

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
    const e = {};
    if (touched.title && !title.trim()) e.title = "Title is required";
    if (touched.game && !game.trim()) e.game = "Game is required";
    if (touched.startMoney) {
      if (startMoney === "") e.startMoney = "Start money is required";
      else if (startNum === null) e.startMoney = "Enter a valid number";
    }
    if (touched.endMoney) {
      if (endMoney === "") e.endMoney = "End money is required";
      else if (endNum === null) e.endMoney = "Enter a valid number";
    }
    return e;
  }, [touched, title, game, startMoney, endMoney, startNum, endNum]);

  const isValid =
    title.trim() &&
    game.trim() &&
    startNum !== null &&
    endNum !== null &&
    startMoney !== "" &&
    endMoney !== "";

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, game: true, startMoney: true, endMoney: true });

    if (!isValid) {
      toast.error("Fix the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/session", {
        title: title.trim(),
        game: game.trim(),
        startMoney: startNum,
        endMoney: endNum,
        notes: notes.trim(),
      });
      toast.success("Session saved");
      navigate("/");
    } catch (error) {
      console.log("Error creating session", error);
      toast.error("Failed to save session");
    } finally {
      setLoading(false);
    }
  };

  const resultBadgeClass =
    resultPreview === "WIN"
      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_-4px_rgba(52,211,153,0.45)]"
      : resultPreview === "LOSS"
        ? "border-rose-400/50 bg-rose-500/15 text-rose-300 shadow-[0_0_24px_-4px_rgba(251,113,133,0.4)]"
        : resultPreview === "DRAW"
          ? "border-slate-500/50 bg-slate-500/15 text-slate-300"
          : "";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(34,211,238,0.12),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(167,139,250,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.92))]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24">
        <div className="mx-auto max-w-xl">
          <Link
            to="/"
            className="group mb-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)]"
          >
            <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back
          </Link>

          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Create New Session
            </h1>
            <p className="mt-3 text-base text-slate-400 sm:text-lg">
              Track your performance and improve every session
            </p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_48px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="session-title" className="mb-2 block text-sm font-semibold text-slate-200">
                  Title
                </label>
                <input
                  id="session-title"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Friday night cash game"
                  className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none ring-violet-500/0 transition-all duration-300 placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/30 ${
                    errors.title ? "border-rose-500/50" : "border-white/10 hover:border-violet-400/25"
                  }`}
                  value={title}
                  onBlur={() => markTouched("title")}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <p className="mt-1.5 text-sm text-rose-400">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="session-game" className="mb-2 block text-sm font-semibold text-slate-200">
                  Game
                </label>
                <input
                  id="session-game"
                  list="game-suggestions"
                  type="text"
                  autoComplete="off"
                  placeholder="Choose or type a game"
                  className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/25 ${
                    errors.game ? "border-rose-500/50" : "border-white/10 hover:border-cyan-400/25"
                  }`}
                  value={game}
                  onBlur={() => markTouched("game")}
                  onChange={(e) => setGame(e.target.value)}
                />
                <datalist id="game-suggestions">
                  {GAME_SUGGESTIONS.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
                {errors.game && <p className="mt-1.5 text-sm text-rose-400">{errors.game}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="start-money" className="mb-2 block text-sm font-semibold text-slate-200">
                    Start money
                  </label>
                  <input
                    id="start-money"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="0"
                    className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 [appearance:textfield] placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.startMoney ? "border-rose-500/50" : "border-white/10 hover:border-violet-400/25"
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
                  <label htmlFor="end-money" className="mb-2 block text-sm font-semibold text-slate-200">
                    End money
                  </label>
                  <input
                    id="end-money"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder="0"
                    className={`w-full rounded-2xl border bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 [appearance:textfield] placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      errors.endMoney ? "border-rose-500/50" : "border-white/10 hover:border-cyan-400/25"
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
                        className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold tracking-wide transition-transform duration-300 hover:scale-[1.02] ${resultBadgeClass}`}
                      >
                        {resultPreview}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="session-notes" className="mb-2 block text-sm font-semibold text-slate-200">
                  Notes
                </label>
                <textarea
                  id="session-notes"
                  rows={4}
                  placeholder="Hands played, leaks spotted, mental game…"
                  className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all duration-300 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-[0_0_32px_-4px_rgba(139,92,246,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePage;
