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
  const [user, setUser] = useState<User | null>(null); // ✅ Define type explicitly

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
      .then((res) => setUser(res.data)) // ✅ Now TypeScript knows the type
      .catch(() => router.push("/auth/login"));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl">
        Welcome, {user?.name || "Admin"}!
      </h1>
    </div>
  );
}