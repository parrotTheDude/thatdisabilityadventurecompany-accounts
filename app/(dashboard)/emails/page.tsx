"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function BulkEmailPage() {
  const [subscriptionLists, setSubscriptionLists] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptionLists();
  }, []);

  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptionLists(res.data.map((list: { list_name: string }) => list.list_name));
    } catch (err) {
      setError("Failed to load subscription lists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bulk Email Sender</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Subscription List Dropdown */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Subscription List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a List</option>
            {subscriptionLists.map((list) => (
              <option key={list} value={list}>
                {list}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Email Subject */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Email Subject</h2>
        <input
          type="text"
          placeholder="Enter email subject"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email Body */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Email Body</h2>
        <textarea
          placeholder="Enter email content..."
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className="border p-3 rounded-lg w-full h-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Send Button */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        onClick={() => alert("Send functionality to be implemented!")}
      >
        Send Email
      </button>
    </div>
  );
}