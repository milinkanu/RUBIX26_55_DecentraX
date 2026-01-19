import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Bell } from "lucide-react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

export function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const sidebarRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);

    if (parsedUser) fetchNotifications(parsedUser.email);
  }, [location]);

  const handleClaimAction = async (claimId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/claim/${claimId}`,
        { status }
      );
      setNotifications((prev) => prev.filter((claim) => claim._id !== claimId));
    } catch (err) {
      console.error("Error updating claim status:", err);
    }
  };

  const fetchNotifications = async (email) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/claim/notifications/${email}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="relative z-[999]">
      <div className="bg-black/90 p-4 sticky top-0 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
        <NavLink to="/" className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
          <span className="text-xl font-bold text-white">FoundIt!</span>
        </NavLink>

        <div className="hidden lg:flex gap-6">
          {["home", "find", "post"].map((path) => (
            <NavLink
              key={path}
              to={`/${path}`}
              className={({ isActive }) =>
                `hover:text-yellow-400 transition-colors ${isActive ? "text-yellow-400" : "text-white"
                }`
              }
            >
              {path === "home"
                ? "Home"
                : path === "find"
                  ? "Find Item"
                  : "Post Item"}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 relative">
          {user && (
            <div className="relative" ref={dropdownRef}>
              <Bell
                className="text-yellow-400 h-6 w-6 cursor-pointer"
                onClick={() => setShowDropdown((prev) => !prev)}
              />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {notifications.length}
                </span>
              )}

              {showDropdown && (
                <div className="absolute right-0 mt-3 bg-neutral-900/95 text-white p-3 rounded-lg shadow-xl w-72 border border-white/10">
                  <h4 className="text-gray-200 mb-2 font-semibold text-sm">
                    Notifications
                  </h4>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-4 text-gray-400 text-sm">
                      <p>No new claim requests</p>
                    </div>
                  ) : (
                    notifications.map((claim) => (
                      <div
                        key={claim._id}
                        className="text-sm border-b border-white/10 pb-2 mb-2 hover:bg-white/5 rounded-md p-2 transition"
                      >
                        <p>
                          <span className="text-gray-300">Username:</span>{" "}
                          {claim.claimantName}
                        </p>
                        <p>
                          <span className="text-gray-300">Item:</span>{" "}
                          {claim.itemId.title}
                        </p>
                        <p>
                          <span className="text-gray-300">Answer:</span>{" "}
                          {claim.answer}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleClaimAction(claim._id, "approved")
                            }
                            className="bg-green-500/90 px-2 py-1 rounded text-white text-xs hover:bg-green-600 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleClaimAction(claim._id, "rejected")
                            }
                            className="bg-red-500/90 px-2 py-1 rounded text-white text-xs hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <span className="text-white text-sm hidden sm:block">
                👋 Hello,{" "}
                <span className="text-yellow-400 font-semibold">
                  {user.name || user.email}
                </span>
              </span>

              <button
                onClick={handleLogout}
                className="hidden lg:inline-flex bg-yellow-400 text-black px-3 py-1.5 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            ref={buttonRef}
            onClick={handleSidebarToggle}
            className="lg:hidden text-white focus:outline-none"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-56 bg-black/95 backdrop-blur-lg border-l border-yellow-400 flex flex-col justify-center items-center gap-8 text-white transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {user && (
          <p className="text-sm text-gray-300 text-center mb-4">
            👋 Hello,{" "}
            <span className="text-yellow-400 font-semibold">
              {user.name || user.email}
            </span>
          </p>
        )}

        {["home", "find", "post"].map((path) => (
          <NavLink
            key={path}
            to={`/${path}`}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `hover:text-yellow-400 transition-colors ${isActive ? "text-yellow-400" : "text-white"
              }`
            }
          >
            {path === "home"
              ? "Home"
              : path === "find"
                ? "Find Item"
                : "Post Item"}
          </NavLink>
        ))}

        {user ? (
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              onClick={() => setSidebarOpen(false)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setSidebarOpen(false)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
