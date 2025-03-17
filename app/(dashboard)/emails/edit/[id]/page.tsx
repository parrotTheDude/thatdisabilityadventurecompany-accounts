"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";

export default function EditEmailTemplatePage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
  
    setSendingTest(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emails/test-send`,
        {
          email: testEmail,
          templateContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("Test email sent successfully!");
    } catch (err) {
      setError("Failed to send test email.");
    } finally {
      setSendingTest(false);
    }
  };

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTemplateName(res.data.name);
      setTemplateContent(res.data.content);
    } catch (err) {
      setError("Failed to load email template.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      setError("Both name and content are required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emails/templates/${id}`,
        {
          name: templateName,
          content: templateContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/emails/edit/${id}?success=true`);
    } catch (err) {
      setError("Failed to save email template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Email Template</h1>

      {success && (
        <p className="text-green-600 mb-4 bg-green-100 p-2 rounded-md">
          ✔ Email template updated successfully!
        </p>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Buttons Section */}
    <div className="mb-6 flex items-center space-x-4">
    {/* Back Button */}
    <button
        onClick={() => router.push("/emails")}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
    >
        Back
    </button>

    {/* Save Button */}
    <button
        onClick={handleSaveTemplate}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        disabled={saving}
    >
        {saving ? "Saving..." : "Save Changes"}
    </button>

    {/* Input for Test Email */}
    <input
        type="email"
        placeholder="Enter test email"
        value={testEmail}
        onChange={(e) => setTestEmail(e.target.value)}
        className="border p-2 rounded-md"
    />

    {/* Send Test Email Button */}
    <button
        onClick={handleSendTestEmail}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        disabled={sendingTest}
    >
        {sendingTest ? "Sending..." : "Send Test Email"}
    </button>
    </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Template Name */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Template Name</h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Template Content */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Template Content (HTML)</h2>
            <textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              className="border p-3 rounded-lg w-full h-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email Preview */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Email Preview</h2>
        <div
            dangerouslySetInnerHTML={{ __html: templateContent }}
            className="border p-3 rounded-lg bg-gray-100"
        />
        </div>
        </>
      )}
    </div>
  );
}