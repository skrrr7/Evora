import React from "react";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={EvoraLogo} alt="Evora Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold text-gray-900">Evora</span>
        </div>

        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Session
        </button>
      </div>
    </nav>
  );
};

export default Navbar;