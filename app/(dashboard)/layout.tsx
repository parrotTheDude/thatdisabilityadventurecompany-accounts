"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔍 Checking token before API call:", token);

    if (!token) {
      console.log("❌ No token found, redirecting to login.");
      setIsAuthenticated(false);
      router.push("/auth/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ User authenticated:", res.data);
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.log("❌ Invalid token, logging out:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/auth/login");
      });
  }, []);

  if (isAuthenticated === null) {
    return <main className="flex items-center justify-center min-h-screen"><p>Loading...</p></main>;
  }

  return isAuthenticated ? (
    <div className="flex h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  ) : (
    <main className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </main>
  );
}

// 🔹 Updated Header (Now Full-Width & Includes Logo)
function Header({ user }: { user: { name: string } | null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md py-4 px-6 w-full flex justify-between items-center">
      {/* Logo Inside Header */}
      <img
        src="https://thatdisabilityadventurecompany.com.au/icons/logo.webp"
        alt="TDAC Logo"
        className="h-16 w-auto"
      />

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          <span className="text-gray-900">{user?.name || "Admin"}</span>
          <span className="text-gray-500 text-sm">▼</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
            <ul className="py-2">
              <li className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
                <img src="/icons/user.svg" alt="Profile Icon" className="w-5 h-5 mr-2" />
                Profile
              </li>
              <li
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/auth/login";
                }}
                className="flex items-center px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
              >
                <img src="/icons/logout.svg" alt="Logout Icon" className="w-5 h-5 mr-2" />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

// 🔹 Sidebar Component (Now White & Thinner)
function Sidebar() {
  return (
    <aside className="bg-white text-black w-48 flex flex-col p-4 border-r border-gray-300">
      <nav className="space-y-2">
        <NavItem href="/dashboard" label="Dashboard" icon="/icons/home.svg" />
        <NavItem href="/users" label="Users" icon="/icons/team.svg" />
        <NavItem href="/subscriptions" label="Subscriptions" icon="/icons/ticket.svg" />
        <NavItem href="/emails" label="Emails" icon="/icons/email.svg" />
      </nav>
    </aside>
  );
}

// 🔹 Sidebar Navigation Links
function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a href={href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition">
      <img src={icon} alt={`${label} Icon`} className="w-5 h-5" />
      <span>{label}</span>
    </a>
  );
}