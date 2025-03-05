"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => router.push("/auth/login"));
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
    
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold">Welcome, {user?.name || "Admin"}!</h1>
      <p className="text-lg text-gray-600">Manage your admin dashboard here.</p>

      {/* 🔹 Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Log Out
      </button>
    </div>
  );
}