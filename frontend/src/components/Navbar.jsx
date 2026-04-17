import React from "react";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  return (
    <nav className="navbar border-b border-base-300 bg-base-100 px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center">
        <div className="navbar-start">
          <div className="btn btn-ghost pointer-events-none gap-3 px-2 normal-case hover:bg-transparent">
            <div className="h-8 w-8 shrink-0 overflow-hidden">
              <img
                src={EvoraLogo}
                alt="Evora Logo"
                className="h-full w-full scale-[1.75] object-contain"
              />
            </div>
            <span className="text-2xl font-semibold leading-none">Evora</span>
          </div>
        </div>
        <div className="navbar-end">
          <button
            type="button"
            className="btn btn-sm border-sky-300 bg-sky-200 text-sky-900 hover:border-sky-400 hover:bg-sky-300 md:btn-md"
          >
            Add Session
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;