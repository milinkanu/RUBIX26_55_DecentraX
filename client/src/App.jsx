import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./components/Navbar.jsx";
import { Home } from "./components/Home.jsx";
import { FindItem } from "./components/FindItem.jsx";
import { PostItem } from "./components/PostItem.jsx";

import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <main >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<FindItem />} />
            <Route path="/post" element={<PostItem />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
