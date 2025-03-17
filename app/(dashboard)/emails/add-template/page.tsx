"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AddEmailTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      setError("Both name and content are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emails/templates`,
        {
          name: templateName,
          content: templateContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/emails?success=true");
    } catch (err) {
      setError("Failed to save email template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add Email Template</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Template Name */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Template Name</h2>
        <input
          type="text"
          placeholder="Enter template name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Template Content */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Template Content (HTML)</h2>
        <textarea
          placeholder="Paste BeeFree HTML code here..."
          value={templateContent}
          onChange={(e) => setTemplateContent(e.target.value)}
          className="border p-3 rounded-lg w-full h-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveTemplate}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Template"}
      </button>
    </div>
  );
}