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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // ✅ Only check localStorage

    if (!token) {
      router.push("/auth/login");
      return;
    }

    setIsAuthenticated(true);

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/auth/login");
      });
  }, []);

  return isAuthenticated ? (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  ) : (
    <main className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </main>
  );
}

// 🔹 Sidebar Component (Admin Panel)
function Sidebar() {
  return (
    <aside className="bg-gray-900 text-white w-64 flex flex-col p-6">
      <div className="flex items-center mb-6">
        <img
          src="https://thatdisabilityadventurecompany.com.au/icons/whiteLogo.webp"
          alt="TDAC Logo"
          className="h-18 w-auto"
        />
      </div>
      <nav className="space-y-4">
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/dashboard/users" label="Users" />
        <NavItem href="/dashboard/subscriptions" label="Subscriptions" />
        <NavItem href="/dashboard/emails" label="Emails" />
      </nav>
    </aside>
  );
}

// 🔹 Header Component (User Dropdown in Top Right)
function Header({ user }: { user: { name: string } | null }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
      <div></div>
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

// 🔹 Sidebar Navigation Links
function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="block p-3 rounded-lg hover:bg-gray-700 transition">
      {label}
    </a>
  );
}