import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Trash2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/Ratelimit";
import SessionNotFound from "../components/SessionNotFound";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function deriveSessionRow(session) {
  const hasMoney =
    session.startMoney !== undefined &&
    session.endMoney !== undefined &&
    Number.isFinite(Number(session.startMoney)) &&
    Number.isFinite(Number(session.endMoney));
  const profit = hasMoney ? Number(session.endMoney) - Number(session.startMoney) : null;
  const result =
    profit === null
      ? session.result && ["WIN", "LOSS", "DRAW"].includes(session.result)
        ? session.result
        : null
      : profit > 0
        ? "WIN"
        : profit < 0
          ? "LOSS"
          : "DRAW";
  return { profit, result, hasMoney, date: new Date(session.createdAt) };
}

function resultStyles(result) {
  if (result === "WIN") return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20";
  if (result === "LOSS") return "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20";
  if (result === "DRAW") return "bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/20";
  return "bg-zinc-800 text-zinc-500 ring-1 ring-zinc-700";
}

function Sparkline({ values }) {
  if (values.length < 2) {
    return (
      <div className="flex h-[72px] items-center justify-center rounded-md bg-zinc-900/50 text-xs text-zinc-500">
        Add more sessions with balances to see a trend
      </div>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = max === min ? 1 : (max - min) * 0.08;
  const lo = min - pad;
  const hi = max + pad;
  const w = 100;
  const h = 36;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - lo) / (hi - lo || 1)) * h;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const polylinePoints = pts.join(" ");
  const last = values[values.length - 1];
  const first = values[0];
  const up = last >= first;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[72px] w-full overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "rgb(52 211 153 / 0.25)" : "rgb(244 63 94 / 0.2)"} />
          <stop offset="100%" stopColor="rgb(24 24 27 / 0)" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${polylinePoints} ${w},${h}`}
        fill="url(#spark)"
        className="opacity-90"
      />
      <polyline
        fill="none"
        stroke={up ? "rgb(52 211 153)" : "rgb(251 113 133)"}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SessionTableRow({ row, setSession }) {
  const { session, profit, result } = row;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this session?")) return;
    try {
      await api.delete(`/session/${session._id}`);
      setSession((prev) => prev.filter((s) => s._id !== session._id));
      toast.success("Session deleted");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete");
    }
  };

  return (
    <Link
      to={`/session/${session._id}`}
      className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 border-b border-zinc-800/40 px-4 py-3.5 transition-colors hover:bg-zinc-800/30 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)_5.25rem_5.25rem_8.5rem_2.5rem]"
    >
      <span className="min-w-0 truncate font-medium text-zinc-100">{session.title}</span>
      <span className="hidden min-w-0 truncate text-left text-sm text-zinc-400 sm:block">{session.game || "—"}</span>
      <span className="flex justify-end">
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${resultStyles(result)}`}
        >
          {result ?? "—"}
        </span>
      </span>
      <span
        className={`text-right text-sm font-medium tabular-nums ${
          profit == null ? "text-zinc-600" : profit > 0 ? "text-emerald-400" : profit < 0 ? "text-rose-400" : "text-zinc-400"
        }`}
      >
        {profit == null ? "—" : `${profit >= 0 ? "+" : ""}${formatMoney(profit)}`}
      </span>
      <span className="hidden text-right text-xs tabular-nums text-zinc-400 sm:block">{formatDate(row.date)}</span>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDelete}
          className="flex justify-end rounded-md p-1.5 text-zinc-500 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
          aria-label="Delete session"
        >
          <Trash2Icon className="size-4" />
        </button>
      </div>
    </Link>
  );
}

function Kpi({ label, value, hint }) {
  // Added conditional text tint to Net P/L if it highlights positive/negative totals dynamically
  const isNetPL = label === "Net P/L";
  const isNegative = value.includes("-");
  const isPositive = value.includes("+");
  
  let valueColor = "text-zinc-50";
  if (isNetPL && isNegative) valueColor = "text-rose-400";
  if (isNetPL && isPositive) valueColor = "text-emerald-400";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

const HomePage = () => {
  const [rateLimited, setIsRateLimited] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSessions = async () => {
      try {
        const res = await api.get("/session");
        setSessions(res.data);
        setIsRateLimited(false);
      } catch (error) {
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load sessions");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const rows = useMemo(
    () =>
      sessions.map((s) => ({
        session: s,
        ...deriveSessionRow(s),
      })),
    [sessions]
  );

  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let net = 0;
    let counted = 0;
    for (const r of rows) {
      if (r.profit != null) {
        net += r.profit;
        counted += 1;
      }
      if (r.result === "WIN") wins += 1;
      else if (r.result === "LOSS") losses += 1;
      else if (r.result === "DRAW") draws += 1;
    }
    const outcomes = wins + losses + draws;
    const winRate = outcomes > 0 ? Math.round((wins / outcomes) * 100) : null;
    return { wins, losses, draws, net, winRate, withProfit: counted };
  }, [rows]);

  const cumulativeSeries = useMemo(() => {
    const withProfit = rows.filter((r) => r.profit != null).sort((a, b) => a.date - b.date);
    let cum = 0;
    return withProfit.map((r) => {
      cum += r.profit;
      return cum;
    });
  }, [rows]);

  const monthly = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const d = r.date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(key)) {
        const [y, mo] = key.split("-").map(Number);
        const label = new Date(y, mo - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        map.set(key, { key, label, profit: 0, count: 0 });
      }
      const b = map.get(key);
      b.count += 1;
      if (r.profit != null) b.profit += r.profit;
    }
    return Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [rows]);

  const monthBarMax = useMemo(() => Math.max(...monthly.map((m) => Math.abs(m.profit)), 1), [monthly]);

  const gameWinRates = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const g = (r.session.game && String(r.session.game).trim()) || "Unknown";
      if (!map.has(g)) {
        map.set(g, { game: g, wins: 0, losses: 0, draws: 0, sessions: 0 });
      }
      const x = map.get(g);
      x.sessions += 1;
      if (r.result === "WIN") x.wins += 1;
      else if (r.result === "LOSS") x.losses += 1;
      else if (r.result === "DRAW") x.draws += 1;
    }
    return Array.from(map.values())
      .map((x) => {
        const outcomes = x.wins + x.losses + x.draws;
        return {
          ...x,
          outcomes,
          winRate: outcomes > 0 ? (x.wins / outcomes) * 100 : null,
        };
      })
      .filter((x) => x.outcomes > 0)
      .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0) || b.outcomes - a.outcomes);
  }, [rows]);

  const gameHighLow = useMemo(() => {
    if (gameWinRates.length === 0) return { best: null, worst: null };
    const best = gameWinRates[0];
    const worst = gameWinRates[gameWinRates.length - 1];
    if (gameWinRates.length === 1) return { best, worst: null };
    return { best, worst };
  }, [gameWinRates]);

  const winLossTotal = stats.wins + stats.losses + stats.draws;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0B0F19] font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(139,92,246,0.18),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_60%,rgba(34,211,238,0.05),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[#0B0F19]" />

      <Navbar />
      {rateLimited && <RateLimitedUI />}

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6">
        {loading && (
          <div className="py-20 text-center text-sm text-zinc-500">Loading dashboard…</div>
        )}

        {!loading && !rateLimited && sessions.length === 0 && <SessionNotFound />}

        {!loading && !rateLimited && sessions.length > 0 && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-400">Evora — session performance at a glance</p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Kpi
                label="Net P/L"
                value={
                  stats.withProfit === 0
                    ? "—"
                    : `${stats.net >= 0 ? "+" : ""}${formatMoney(stats.net)}`
                }
                hint={
                  stats.withProfit > 0
                    ? `${stats.withProfit} session${stats.withProfit === 1 ? "" : "s"} with balances`
                    : undefined
                }
              />
              <Kpi
                label="Win rate"
                value={stats.winRate != null ? `${stats.winRate}%` : "—"}
                hint={
                  winLossTotal > 0
                    ? `${stats.wins}W · ${stats.losses}L${stats.draws ? ` · ${stats.draws}D` : ""}`
                    : undefined
                }
              />
              <Kpi label="Sessions" value={String(sessions.length)} hint="Total recorded" />
            </div>

            {/* UPGRADED SESSIONS CONTAINER: Max-height and view limits added */}
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Recent Sessions</h2>
                <span className="text-xs text-zinc-500">Newest first</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
                
                {/* Fixed and Sticky Table Header block */}
                <div className="sticky top-0 z-10 hidden border-b border-zinc-800 bg-[#161B26] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 sm:grid sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)_5.25rem_5.25rem_8.5rem_2.5rem] sm:gap-x-3">
                  <span className="text-left">Session</span>
                  <span className="text-left">Game</span>
                  <span className="text-right">Result</span>
                  <span className="text-right">P/L</span>
                  <span className="text-right">Date</span>
                  <span className="block min-h-3 min-w-10 shrink-0" aria-hidden />
                </div>
                
                {/* Scrollable Container Window */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-800/50 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {rows.map((row) => (
                    <SessionTableRow key={row.session._id} row={row} setSession={setSessions} />
                  ))}
                </div>
              </div>
            </section>

            <div className="mb-8 grid gap-6 lg:grid-cols-5">
              <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm lg:col-span-3">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Net performance</h2>
                  <span className="text-xs text-zinc-500">Cumulative profit</span>
                </div>
                <div className="mt-6">
                  <Sparkline values={cumulativeSeries} />
                </div>
              </section>

              <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm lg:col-span-2">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Outcomes</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Win / loss / draw mix</p>
                {winLossTotal === 0 ? (
                  <p className="mt-6 text-sm text-zinc-500">No labeled outcomes yet</p>
                ) : (
                  <>
                    <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-zinc-800">
                      {stats.wins > 0 && (
                        <div
                          className="bg-emerald-500/80"
                          style={{ width: `${(stats.wins / winLossTotal) * 100}%` }}
                          title={`Wins: ${stats.wins}`}
                        />
                      )}
                      {stats.losses > 0 && (
                        <div
                          className="bg-rose-500/80"
                          style={{ width: `${(stats.losses / winLossTotal) * 100}%` }}
                          title={`Losses: ${stats.losses}`}
                        />
                      )}
                      {stats.draws > 0 && (
                        <div
                          className="bg-zinc-500"
                          style={{ width: `${(stats.draws / winLossTotal) * 100}%` }}
                          title={`Draws: ${stats.draws}`}
                        />
                      )}
                    </div>
                    <ul className="mt-5 space-y-2.5 text-sm">
                      <li className="flex justify-between text-zinc-400">
                        <span className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Wins
                        </span>
                        <span className="font-semibold tabular-nums text-zinc-200">{stats.wins}</span>
                      </li>
                      <li className="flex justify-between text-zinc-400">
                        <span className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-rose-500" />
                          Losses
                        </span>
                        <span className="font-semibold tabular-nums text-zinc-200">{stats.losses}</span>
                      </li>
                      <li className="flex justify-between text-zinc-400">
                        <span className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-zinc-500" />
                          Draws
                        </span>
                        <span className="font-semibold tabular-nums text-zinc-200">{stats.draws}</span>
                      </li>
                    </ul>
                  </>
                )}
              </section>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
              <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Monthly progress</h2>
                <p className="mt-0.5 text-xs text-zinc-500">Net profit by calendar month</p>
                {monthly.length === 0 ? (
                  <p className="mt-6 text-sm text-zinc-500">No data</p>
                ) : (
                  <ul className="mt-5 flex-1 space-y-3.5">
                    {monthly.map((m) => {
                      const w = (Math.abs(m.profit) / monthBarMax) * 100;
                      return (
                        <li key={m.key} className="flex items-center gap-4">
                          <span className="w-24 shrink-0 text-xs font-medium text-zinc-400">{m.label}</span>
                          <div className="min-w-0 flex-1">
                            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                              <div
                                className={`h-full rounded-full ${m.profit >= 0 ? "bg-emerald-500/70" : "bg-rose-500/70"}`}
                                style={{ width: `${w}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={`w-20 shrink-0 text-right text-xs font-semibold tabular-nums ${
                              m.profit > 0 ? "text-emerald-400" : m.profit < 0 ? "text-rose-400" : "text-zinc-500"
                            }`}
                          >
                            {m.profit === 0 ? "0" : `${m.profit > 0 ? "+" : ""}${formatMoney(m.profit)}`}
                          </span>
                          <span className="hidden w-10 shrink-0 text-right text-[11px] text-zinc-500 sm:block">
                            {m.count}×
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
                <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Win rate by game</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Wins ÷ (wins + losses + draws), only sessions with a recorded outcome
                </p>

                {gameWinRates.length === 0 ? (
                  <p className="mt-5 text-sm text-zinc-500">No data recorded.</p>
                ) : (
                  <>
                    {(gameHighLow.best || gameHighLow.worst) && (
                      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/30 px-3 py-2.5 text-xs">
                        {gameHighLow.best && (
                          <p className="text-zinc-400">
                            <span className="font-semibold text-emerald-400">Highest</span>
                            <span className="mx-1.5 text-zinc-700">·</span>
                            <span className="text-zinc-200">{gameHighLow.best.game}</span>
                            <span className="ml-1.5 font-medium tabular-nums text-zinc-100">
                              {Math.round(gameHighLow.best.winRate)}%
                            </span>
                            <span className="ml-1 text-[10px] text-zinc-500">
                              ({gameHighLow.best.wins}W-{gameHighLow.best.losses}L)
                            </span>
                          </p>
                        )}
                        {gameHighLow.worst && (
                          <p className="text-zinc-400">
                            <span className="font-semibold text-rose-400">Lowest</span>
                            <span className="mx-1.5 text-zinc-700">·</span>
                            <span className="text-zinc-200">{gameHighLow.worst.game}</span>
                            <span className="ml-1.5 font-medium tabular-nums text-zinc-100">
                              {Math.round(gameHighLow.worst.winRate)}%
                            </span>
                            <span className="ml-1 text-[10px] text-zinc-500">
                              ({gameHighLow.worst.wins}W-{gameHighLow.worst.losses}L)
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 min-w-0 overflow-x-auto">
                      <table className="w-full min-w-[240px] text-left text-sm">
                        <thead>
                          <tr class="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                            <th className="py-2 pr-4 font-semibold">Game</th>
                            <th className="py-2 pr-4 font-semibold tabular-nums">Sessions</th>
                            <th className="py-2 pr-4 font-semibold">W–L–D</th>
                            <th className="py-2 text-right font-semibold tabular-nums">Win rate</th>
                          </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-zinc-800/40">
                          {gameWinRates.map((g) => (
                            <tr key={g.game} className="last:border-0">
                              <td className="py-2.5 pr-4 font-medium text-zinc-100">{g.game}</td>
                              <td className="py-2.5 pr-4 tabular-nums text-zinc-400">{g.sessions}</td>
                              <td className="py-2.5 pr-4 tabular-nums text-zinc-500">
                                {g.wins}-{g.losses}-{g.draws}
                              </td>
                              <td className="py-2.5 text-right font-medium tabular-nums text-zinc-200">
                                {g.winRate != null ? `${Math.round(g.winRate)}%` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;