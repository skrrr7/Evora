import { LayoutGridIcon } from "lucide-react";
import { Link } from "react-router";

const SessionNotFound = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border border-zinc-800/80 bg-zinc-900/20 py-16 text-center">
      <div className="rounded-full border border-zinc-800 bg-zinc-900/50 p-5">
        <LayoutGridIcon className="size-8 text-zinc-500" aria-hidden />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-zinc-100">No sessions yet</h3>
      <p className="mt-2 px-6 text-sm leading-relaxed text-zinc-500">
        Log your first session to see performance trends and analytics here.
      </p>
      <Link
        to="/create"
        className="mt-8 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
      >
        New session
      </Link>
    </div>
  );
};

export default SessionNotFound;
