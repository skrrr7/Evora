import React from 'react'
import {Route, Routes } from "react-router";

import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import SessionDetailPage from "./pages/SessionDetailPage"
import toast from "react-hot-toast";


const App = () => {
  return (
  <div data-theme="pastel">
    <Routes>
      <Route path="/" element ={<HomePage />}></Route>
      <Route path="/create" element ={<CreatePage />}></Route>
      <Route path="/session/:id" element ={<SessionDetailPage />}></Route>
    </Routes>

  </div>
  );
};

export default App