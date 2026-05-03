import React, { useState } from "react";
import { MenuIcon, PlusIcon, XIcon } from "lucide-react";
import { Link } from "react-router";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVisibilityClass = isOpen ? "block" : "hidden";

  return (
    <nav className="fixed start-0 top-0 z-20 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-3">
          <img src={EvoraLogo} className="h-14 w-14 object-contain" alt="EVORA logo" />
          <span className="whitespace-nowrap text-3xl leading-none font-medium text-slate-100">EVORA</span>
        </Link>

        <div className="inline-flex items-center space-x-3 md:order-2 md:space-x-0">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-lg font-semibold leading-5 text-slate-100 hover:bg-slate-700"
          >
            <PlusIcon className="size-4" />
            Add Session
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 md:hidden"
            aria-controls="navbar-cta"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        <div
          id="navbar-cta"
          className={`${menuVisibilityClass} w-full items-center justify-between md:order-1 md:flex md:w-auto`}
        >
          <ul className="mt-4 flex flex-col rounded-lg border border-white/10 bg-slate-900 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent md:p-0">
            <li>
              <Link
                to="/"
                className="block rounded px-3 py-2 text-lg text-slate-100 font-semibold hover:bg-slate-800 md:p-0 md:hover:bg-transparent md:hover:text-cyan-300"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/create"
                className="block rounded px-3 py-2 text-lg text-slate-100 font-semibold hover:bg-slate-800 md:p-0 md:hover:bg-transparent md:hover:text-cyan-300"
                onClick={() => setIsOpen(false)}
              >
                Session
              </Link>
            </li>
            <li>
              <Link
                to="/stats"
                className="block rounded px-3 py-2 text-lg text-slate-100 font-semibold hover:bg-slate-800 md:p-0 md:hover:bg-transparent md:hover:text-cyan-300"
                onClick={() => setIsOpen(false)}
              >
                Stats
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;