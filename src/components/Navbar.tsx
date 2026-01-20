"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
    type?: string;
  };
  answer: string;
  status: string;
  finderEmail: string;
  finderName?: string;
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

function NavbarContent() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Claim[]>([]);
  const [matchNotifications, setMatchNotifications] = useState<MatchNotification[]>([]);
  // Use a separate state for history if needed, or just one list.
  // Ideally, one list 'matchNotifications' can handle it if we re-fetch when tab changes.
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
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
  const activeTabRef = useRef<'new' | 'history'>('new');

  // Keep ref in sync
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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
          // Only auto-refresh if we are in 'new' mode or to check badge count.
          // Ideally, we just fetch 'new' stuff for the badge count in background.
          // But if 'history' is open, we might overwrite it. 
          // For now, let's just fetch default (unread) to keep badge up to date 
          // but ONLY if we are NOT viewing history actively in the dropdown?
          // Actually, simplistic approach: always fetch unread for badge.
          // BUT this state 'matchNotifications' drives the dropdown too.

          // Fix: If activeTab is 'history', do not auto-refresh or refresh history?
          // If we are in history, we don't want to overwrite with unread ones.
          if (!document.hidden && activeTabRef.current === 'new') {
            fetchNotifications(parsedUser.email);
            fetchMatchNotifications(parsedUser.email, false);
            fetchChatList(parsedUser.email);
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    }
  }, [pathname]);

  // Listen for chat read events to update badge immediately
  useEffect(() => {
    const handleChatRead = () => {
      if (user?.email) fetchChatList(user.email);
    };

    window.addEventListener('chat-read', handleChatRead);
    return () => window.removeEventListener('chat-read', handleChatRead);
  }, [user]);

  const handleClaimAction = async (claimId: string, status: string) => {
    try {
      await axios.patch(
        `${API_URL}/api/claim/${claimId}`,
        { status }
      );
      setNotifications((prev) => prev.filter((claim) => claim._id !== claimId));

      // If approved, refresh the chat list immediately and navigate
      if (status === 'approved' && user?.email) {
        fetchChatList(user.email);
        router.push(`/chat/${claimId}`);
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

  const fetchMatchNotifications = async (email: string, includeRead: boolean = false) => {
    try {
      const filter = includeRead ? 'all' : 'unread';
      const res = await axios.get(`${API_URL}/api/notifications?email=${email}&filter=${filter}`);
      setMatchNotifications(res.data);
    } catch (err) {
      console.error("Error fetching match notifications:", err);
    }
  };

  const markNotificationRead = async (id: string, itemId?: string, shouldNavigate: boolean = true) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}`);
      setMatchNotifications(prev => prev.filter(n => n._id !== id));

      if (shouldNavigate && itemId) {
        setShowDropdown(false);
        router.push(`/find?itemId=${itemId}`);
      }
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

  // Hide Navbar on chat pages for full-screen experience
  if (pathname?.startsWith("/chat")) {
    return null;
  }

  return (
    <nav className="relative z-[999]">
      <div className="bg-black/90 p-4 sticky top-0 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold">
            F!
          </div>
          <span className="text-xl font-bold text-white">Found<span className="text-yellow-400">It!</span></span>
        </Link>

        <div className="hidden lg:flex gap-6">
          {[
            { path: "/", label: "Home" },
            { path: "/dashboard", label: "Dashboard" },
            { path: "/find", label: "Find Item" }
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
                  <Link href="/chat">
                    <MessageCircle
                      className="text-yellow-400 h-6 w-6 cursor-pointer hover:text-yellow-300 transition-colors"
                    />
                    {chatList.reduce((acc, chat: any) => acc + (chat.unreadCount || 0), 0) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full px-1.5 font-bold border border-black min-w-[18px] h-[18px] flex items-center justify-center">
                        {chatList.reduce((acc, chat: any) => acc + (chat.unreadCount || 0), 0)}
                      </span>
                    )}
                  </Link>
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

                      <div className="flex bg-black/40 p-1 rounded-lg mb-3 mx-1">
                        <button
                          onClick={() => {
                            setActiveTab('new');
                            if (user?.email) {
                              fetchNotifications(user.email);
                              fetchMatchNotifications(user.email, false);
                            }
                          }}
                          className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'new' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                          New
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('history');
                            if (user?.email) {
                              fetchNotifications(user.email); // Fetches claims (pending/approved/rejected)
                              fetchMatchNotifications(user.email, true); // Fetches all history
                            }
                          }}
                          className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                          History
                        </button>
                      </div>

                      {notifications.filter(n => activeTab === 'new' ? n.status === 'pending' : true).length === 0 && matchNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4 text-gray-400 text-sm">
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {matchNotifications.map((notif) => (
                            <div
                              key={notif._id}
                              className="text-sm border-b border-white/10 pb-2 bg-white/5 rounded-md p-3 hover:bg-white/10 transition cursor-pointer group relative"
                              onClick={() => {
                                if (notif.relatedItem) {
                                  // Defensively handle both populated and unpopulated relatedItem
                                  const itemId = (notif.relatedItem as any)._id || notif.relatedItem;
                                  markNotificationRead(notif._id, itemId as string);
                                }
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationRead(notif._id, undefined, false);
                                }}
                                className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
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

                          {notifications
                            .filter(n => {
                              if (activeTab === 'new') return n.status === 'pending';
                              return true; // Show all in history
                            })
                            .map((claim) => {
                              const isFinder = user?.email?.toLowerCase() === claim.finderEmail?.toLowerCase();
                              const isLost = claim.itemId?.type?.toLowerCase() === 'lost';

                              return (
                                <div
                                  key={claim._id}
                                  className="text-sm border-b border-white/10 pb-2 bg-white/5 rounded-md p-3 hover:bg-white/10 transition relative"
                                >
                                  {claim.status === 'pending' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClaimAction(claim._id, "rejected");
                                      }}
                                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold text-yellow-400 mb-1">
                                        {claim.status === 'approved' ? 'Active Chat' :
                                          (isLost && !isFinder ? 'Item Found!' : 'New Claim Request')}
                                      </p>
                                      <p className="text-gray-300 text-xs mb-1">
                                        <span className="text-gray-400">Item:</span>{" "}
                                        {claim.itemId?.title || "Item Deleted"}
                                      </p>

                                      {isLost ? (
                                        !isFinder ? (
                                          <p className="text-gray-300 text-xs mb-1 mt-1 leading-relaxed">
                                            <span className="text-white font-bold">{claim.finderName || claim.finderEmail}</span> wants to connect with you.
                                          </p>
                                        ) : (
                                          <p className="text-gray-300 text-xs mb-1">
                                            <span className="text-gray-400">Owner:</span> {claim.claimantName}
                                          </p>
                                        )
                                      ) : (
                                        <p className="text-gray-300 text-xs mb-1">
                                          <span className="text-gray-400">{isFinder ? "Claimant" : "Finder"}:</span>{" "}
                                          {isFinder ? claim.claimantName : claim.finderEmail}
                                        </p>
                                      )}

                                      {claim.status === 'pending' && isFinder && !isLost && (
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
                                        {/* only show Accept/Reject if YOU are the one who needs to approve 
                                          Found Item: Finder approves. (isFinder = true)
                                          Lost Item: Owner approves. (isFinder = false)
                                      */}
                                        {(
                                          (!isLost && isFinder) ||
                                          (isLost && !isFinder)
                                        ) ? (
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
                                        ) : (
                                          <div className="w-full text-center text-xs text-yellow-500 bg-yellow-400/10 py-1.5 rounded">
                                            {isLost ? "Waiting for Owner" : "Waiting for Finder"}
                                          </div>
                                        )}
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
          { path: "/find", label: "Find Item" }
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

export function Navbar() {
  return (
    <Suspense fallback={<div className="p-4 bg-black text-white">Loading...</div>}>
      <NavbarContent />
    </Suspense>
  );
}
