"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface SubscriptionList {
  list_name: string;
  subscribed_count: number;
  unsubscribed_count: number;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptionLists();
  }, []);

  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Subscription Lists API Response:", res.data); // ✅ Debug log
      setSubscriptions(res.data);
    } catch (err) {
      let errorMessage = "Failed to load subscription lists.";
  
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
  
      console.error("❌ Subscription List Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscriptionList = async () => {
    if (!newListName.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/create`,
        { new_list_name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewListName("");
      fetchSubscriptionLists(); // Refresh the list
    } catch (err) {
      setError("Failed to create subscription list.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscription Management</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Subscription List */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Subscription List</h2>
        <input
          type="text"
          placeholder="Subscription List Name"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="border p-2 w-full rounded-md mb-2"
        />
        <button
          onClick={handleCreateSubscriptionList}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Create List
        </button>
      </div>

      {/* Subscription Lists */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Subscription Lists</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Subscription Name</th>
                <th className="p-3 text-center">Subscribed</th>
                <th className="p-3 text-center">Unsubscribed</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.list_name} className="border-t">
                  <td className="p-3">{sub.list_name}</td>
                  <td className="p-3 text-center">{sub.subscribed_count}</td>
                  <td className="p-3 text-center">{sub.unsubscribed_count}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => router.push(`/subscriptions/${sub.list_name}`)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      View List
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}