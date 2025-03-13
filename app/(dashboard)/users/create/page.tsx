"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    user_type: "",
    gender: "",
    subscriptions: [] as string[], // Subscription lists as checkboxes
  });
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [subscriptionLists, setSubscriptionLists] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Fetch available user types and subscription lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userTypeRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserTypes(userTypeRes.data.map((item: { user_type: string }) => item.user_type));

        const subRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/subscriptions/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptionLists(subRes.data.map((item: { list_name: string }) => item.list_name));
      } catch (err) {
        setError("Failed to load user types or subscriptions.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubscriptionChange = (list_name: string) => {
    setFormData((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.includes(list_name)
        ? prev.subscriptions.filter((sub) => sub !== list_name)
        : [...prev.subscriptions, list_name],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/dashboard/users"); // ✅ Redirect after creation
    } catch (err) {
      setError("Failed to create user.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create New User</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="First Name" onChange={handleChange} className="border p-2 w-full rounded-md" />
        <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 w-full rounded-md" />
        <input type="email" name="email" placeholder="Email" required onChange={handleChange} className="border p-2 w-full rounded-md" />

        <select name="user_type" required onChange={handleChange} className="border p-2 w-full rounded-md">
          <option value="">Select User Type</option>
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select name="gender" onChange={handleChange} className="border p-2 w-full rounded-md">
          <option value="">Select Gender (Optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* Subscription Lists */}
        <div className="border p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
          {subscriptionLists.map((list) => (
            <label key={list} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.subscriptions.includes(list)}
                onChange={() => handleSubscriptionChange(list)}
                className="mr-2"
              />
              {list}
            </label>
          ))}
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded-md hover:bg-blue-600 transition">
          Create User
        </button>
      </form>
    </div>
  );
}