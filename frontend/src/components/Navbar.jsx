import React from "react";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 px-4">
      <div className="flex-1">
        <a className="flex items-center">
          <img src={EvoraLogo} alt="EVORA logo" className="h-25 w-25 object-contain" />
        </a>
      </div>
      <div className="flex-none">
        <button className="btn btn-primary">Add Session</button>
      </div>
    </div>
  );
};

export default Navbar;