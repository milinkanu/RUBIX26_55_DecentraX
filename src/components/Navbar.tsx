"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Bell, Menu, X, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";

interface User {
  name?: string;
  email: string;
}

interface Claim {
  _id: string;
  claimantName: string;
  itemId: {
    title: string;
  };
  answer: string;
  status: string;
  finderEmail: string;
}

interface MatchNotification {
  _id: string;
  title: string;
  message: string;
  relatedItem: {
    _id: string;
    title: string;
    type: string;
  } | null;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Claim[]>([]);
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>([]);
  const [chatList, setChatList] = useState<Claim[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync state with URL on mount/update
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
    } else {
      setSearchTerm("");
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Immediate search (no delay)
    if (value.trim()) {
      router.push(`/find?search=${encodeURIComponent(value.trim())}`);
    } else {
      router.push("/find");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      if (searchTerm.trim()) {
        router.push(`/find?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        router.push("/find");
      }
    }
  };

  useEffect(() => {
    // Client-side only
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);

      if (parsedUser) {
        fetchNotifications(parsedUser.email);
        fetchMatchNotifications(parsedUser.email);
        fetchChatList(parsedUser.email);

        const interval = setInterval(() => {
          fetchNotifications(parsedUser.email);
          fetchMatchNotifications(parsedUser.email);
          fetchChatList(parsedUser.email);
        }, 5000);

        return () => clearInterval(interval);
      }
    }
  }, [pathname]);

  const handleClaimAction = async (claimId: string, status: string) => {
    try {
      await axios.patch(
        `${API_URL}/api/claim/${claimId}`,
        { status }
      );
      setNotifications((prev) => prev.filter((claim) => claim._id !== claimId));

      // If approved, refresh the chat list immediately
      if (status === 'approved' && user?.email) {
        fetchChatList(user.email);
      }
    } catch (err) {
      console.error("Error updating claim status:", err);
    }
  };

  const fetchNotifications = async (email: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/claim/notifications/${email}`
      );
      setNotifications(res.data.filter((n: Claim) => n.status === 'pending'));
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchMatchNotifications = async (email: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications?email=${email}`);
      setMatchNotifications(res.data);
    } catch (err) {
      console.error("Error fetching match notifications:", err);
    }
  };

  const markNotificationRead = async (id: string, itemId: string) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}`);
      setMatchNotifications(prev => prev.filter(n => n._id !== id));
      setShowDropdown(false);
      // Optional: Navigate to item?
      // Since relatedItem is populated, we can assume it exists.
      // But the current page structure usually opens items in a modal (FindItem). 
      // If we are on FindItem, we might want to trigger the modal.
      // Or we can simple navigate to /find?item=ID if we implement that.
      // For now, let's just assume we want to user to go to Find page.
      // Ideally, FindItem page should support opening an item by ID from URL.
      // Let's modify the router push to include query param if possible, or just go to /find.
      // Actually, let's look at FindItem. It has selectedItem state. It doesn't seem to read from URL param yet.
      // I'll just navigate to /find.
      router.push("/find");
      // A future improvement would be to open the modal automatically.
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const fetchChatList = async (email: string) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/chat/list/${email}`
      );
      setChatList(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActiveLink = (path: string) => pathname === path;

  return (
    <nav className="relative z-[999]">
      <div className="bg-black/90 p-4 sticky top-0 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
          <span className="text-xl font-bold text-white">FoundIt!</span>
        </Link>

        <div className="hidden lg:flex gap-6">
          {[
            { path: "/", label: "Home" },
            { path: "/dashboard", label: "Dashboard" },
            { path: "/find", label: "Find Item" },
            { path: "/post", label: "Post Item" }
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`hover:text-yellow-400 transition-colors ${isActiveLink(item.path) ? "text-yellow-400" : "text-white"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 relative">




          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent border border-yellow-400 rounded-full py-1.5 px-4 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 w-48 lg:w-64 transition-all"
            />
            <Search className="h-4 w-4 text-yellow-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-4">
                {/* Chat Icon */}
                <div className="relative">
                  <MessageCircle
                    className="text-yellow-400 h-6 w-6 cursor-pointer"
                    onClick={() => {
                      setShowChatDropdown(prev => !prev);
                      setShowDropdown(false);
                      if (!showChatDropdown && user) fetchChatList(user.email);
                    }}
                  />
                  {chatList.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1.5">
                      {chatList.length}
                    </span>
                  )}

                  {showChatDropdown && (
                    <div className="absolute right-0 mt-3 bg-neutral-900/95 text-white p-3 rounded-lg shadow-xl w-72 border border-white/10 z-50">
                      <h4 className="text-gray-200 mb-2 font-semibold text-sm">Active Chats</h4>
                      {chatList.length === 0 ? (
                        <p className="text-gray-400 text-xs text-center py-2">No active chats</p>
                      ) : (
                        chatList.map(chat => {
                          const isFinder = user?.email === chat.finderEmail;
                          const otherParty = isFinder ? chat.claimantName : "Finder";

                          return (
                            <Link
                              key={chat._id}
                              href={`/chat/${chat._id}`}
                              className="block border-b border-white/10 pb-2 mb-2 hover:bg-white/5 rounded-md p-2 transition"
                              onClick={() => setShowChatDropdown(false)}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-yellow-400 text-sm">{otherParty}</span>
                                <span className="text-xs text-gray-500">Active</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-1">
                                Item: {chat.itemId?.title || "Unknown"}
                              </p>
                            </Link>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Notification Icon */}
                <div className="relative">
                  <Bell
                    className="text-yellow-400 h-6 w-6 cursor-pointer"
                    onClick={() => {
                      setShowDropdown(prev => !prev);
                      setShowChatDropdown(false);
                    }}
                  />
                  {(notifications.length > 0 || matchNotifications.length > 0) && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                      {notifications.length + matchNotifications.length}
                    </span>
                  )}

                  {showDropdown && (
                    <div className="absolute right-0 mt-3 bg-neutral-900/95 text-white p-3 rounded-lg shadow-xl w-80 border border-white/10 z-50 max-h-96 overflow-y-auto custom-scrollbar">
                      <h4 className="text-gray-200 mb-2 font-semibold text-sm">
                        Notifications
                      </h4>

                      {notifications.length === 0 && matchNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 text-gray-400 text-sm">
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {matchNotifications.map((notif) => (
                            <div
                              key={notif._id}
                              className="text-sm border-b border-white/10 pb-2 bg-white/5 rounded-md p-3 hover:bg-white/10 transition cursor-pointer group"
                              onClick={() => notif.relatedItem && markNotificationRead(notif._id, notif.relatedItem._id)}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl group-hover:scale-110 transition-transform">🔍</span>
                                <div>
                                  <p className="font-semibold text-yellow-400 mb-1">{notif.title}</p>
                                  <p className="text-gray-300 text-xs leading-relaxed">{notif.message}</p>
                                  <p className="text-xs text-blue-400 mt-2 font-medium">Click to view details</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {notifications.map((claim) => {
                            const isFinder = user?.email === claim.finderEmail;

                            return (
                              <div
                                key={claim._id}
                                className="text-sm border-b border-white/10 pb-2 bg-white/5 rounded-md p-3 hover:bg-white/10 transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-yellow-400 mb-1">
                                      {claim.status === 'approved' ? 'Active Chat' : 'New Claim Request'}
                                    </p>
                                    <p className="text-gray-300 text-xs mb-1">
                                      <span className="text-gray-400">Item:</span>{" "}
                                      {claim.itemId?.title || "Item Deleted"}
                                    </p>
                                    <p className="text-gray-300 text-xs mb-1">
                                      <span className="text-gray-400">{isFinder ? "Claimant" : "Finder"}:</span>{" "}
                                      {isFinder ? claim.claimantName : claim.finderEmail}
                                    </p>
                                    {claim.status === 'pending' && isFinder && (
                                      <p className="text-gray-300 text-xs">
                                        <span className="text-gray-400">Answer:</span>{" "}
                                        {claim.answer}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                  {claim.status === 'approved' ? (
                                    <Link
                                      href={`/chat/${claim._id}`}
                                      className="bg-yellow-400 text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-500 transition w-full text-center block"
                                      onClick={() => setShowDropdown(false)}
                                    >
                                      Open Chat
                                    </Link>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleClaimAction(claim._id, "approved")
                                        }
                                        className="bg-green-500/90 px-2 py-1.5 rounded text-white text-xs hover:bg-green-600 transition flex-1 font-semibold"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleClaimAction(claim._id, "rejected")
                                        }
                                        className="bg-red-500/90 px-2 py-1.5 rounded text-white text-xs hover:bg-red-600 transition flex-1 font-semibold"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Profile / Login */}
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
                href="/login"
                className="hidden sm:inline-flex bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
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
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
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

        {[
          { path: "/", label: "Home" },
          { path: "/dashboard", label: "Dashboard" },
          { path: "/find", label: "Find Item" },
          { path: "/post", label: "Post Item" }
        ].map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`hover:text-yellow-400 transition-colors ${isActiveLink(item.path) ? "text-yellow-400" : "text-white"
              }`}
          >
            {item.label}
          </Link>
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
              href="/login"
              onClick={() => setSidebarOpen(false)}
              className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setSidebarOpen(false)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav >
  );
}
