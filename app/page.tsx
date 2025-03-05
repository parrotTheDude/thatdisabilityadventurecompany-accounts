"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to the TDAC Admin Dashboard</h1>
      <p className="text-lg text-gray-600 mb-6">Manage users, subscriptions, and emails with ease.</p>
      
      <button
        onClick={() => router.push("/auth/login")}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Log In
      </button>
    </div>
  );
}