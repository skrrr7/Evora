import React from "react";
import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  return (
    <nav className="fixed start-0 top-0 z-20 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={EvoraLogo} className="h-14 w-14 object-contain" alt="EVORA logo" />
          <span className="whitespace-nowrap text-3xl leading-none font-medium text-slate-100">EVORA</span>
        </Link>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-lg font-semibold leading-5 text-slate-100 hover:bg-slate-700"
        >
          <PlusIcon className="size-4" />
          Add Session
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
