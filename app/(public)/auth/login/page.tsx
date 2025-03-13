"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token); // ✅ Always store in localStorage

      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 w-96">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-4 w-full rounded-md"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-4 w-full rounded-md"
      />

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 w-full rounded-md hover:bg-blue-600 transition mt-4"
      >
        Log In
      </button>
    </div>
  );
}