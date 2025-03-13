"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

interface Subscriber {
  email: string;
  subscribed: boolean;
}

export default function SubscriptionListPage() {
  const router = useRouter();
  const { list_name } = useParams();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, [list_name]);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/${list_name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribers(res.data);
    } catch (err) {
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (email: string, isSubscribed: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/toggle`,
        { email, list_name, subscribed: !isSubscribed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubscribers(); // Refresh after updating
    } catch (err) {
      setError("Failed to update subscription.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Subscription List: {list_name}</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Search Bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 rounded-lg flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Subscribers List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Subscribers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Subscribed</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers
                .filter((sub) => sub.email.toLowerCase().includes(search.toLowerCase()))
                .map((sub) => (
                  <tr key={sub.email} className="border-t">
                    <td className="p-3">{sub.email}</td>
                    <td className="p-3 text-center">{sub.subscribed ? "✅" : "❌"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleSubscription(sub.email, sub.subscribed)}
                        className={`px-3 py-1 text-white rounded-md transition ${
                          sub.subscribed ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {sub.subscribed ? "Unsubscribe" : "Subscribe"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/subscriptions")}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
      >
        Back to Subscription Lists
      </button>
    </div>
  );
}