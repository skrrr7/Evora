import React from "react";
import { Link } from "react-router";
import EvoraLogo from "../assets/EVORA-LOGO.png";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 px-4">
      <div className="navbar-start flex-1">
        <Link to="/" className="flex items-center">
          <img src={EvoraLogo} alt="EVORA logo" className="h-25 w-25 object-contain" />
        </Link>
      </div>
      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-0">
          <li>
            <Link to="/" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/create" className="btn btn-ghost btn-sm">
              Session
            </Link>
          </li>
          <li>
            <Link to="/stats" className="btn btn-ghost btn-sm">
              Stats
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end flex-1">
        <Link to="/create" className="btn btn-primary">
          Add Session
        </Link>
      </div>
    </div>
  );
};

export default Navbar;