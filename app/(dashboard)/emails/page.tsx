"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface EmailTemplate {
  id: number;
  name: string;
  content: string;
}

interface SubscriptionList {
  list_name: string;
}

export default function BulkEmailPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [subscriptionLists, setSubscriptionLists] = useState<SubscriptionList[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState("");
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchEmailTemplates();
    fetchSubscriptionLists();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Email Templates API Response:", res.data); // ✅ Debug log
      setTemplates(res.data);
    } catch (err) {
      let errorMessage = "Failed to load email templates.";
  
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
  
      console.error("❌ Email Templates Error:", errorMessage);
      setError(errorMessage);
    }
  };
  
  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Subscription Lists API Response:", res.data); // ✅ Debug log
      setSubscriptionLists(res.data);
    } catch (err) {
      let errorMessage = "Failed to load subscription lists.";
  
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
  
      console.error("❌ Subscription List Error:", errorMessage);
      setError(errorMessage);
    }
  };

  const handleTemplateChange = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailContent(template.content);

      // Extract Variables (e.g., {{first_name}}, {{event_date}})
      const variableMatches = template.content.match(/{{(.*?)}}/g) || [];
      const extractedVariables: { [key: string]: string } = {};
      variableMatches.forEach((variable) => {
        const key = variable.replace(/{{|}}/g, "");
        extractedVariables[key] = "";
      });
      setVariables(extractedVariables);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate || !selectedList) {
      setError("Please select an email template and a subscription list.");
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/emails/send`,
        {
          list_name: selectedList,
          template_id: selectedTemplate,
          variables,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError("");
      alert("Emails sent successfully!");
    } catch (err) {
      setError("Failed to send emails.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bulk Email Sender</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Select Subscription List */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Subscription List</h2>
        <select
          value={selectedList || ""}
          onChange={(e) => setSelectedList(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select a List</option>
          {subscriptionLists.map((list) => (
            <option key={list.list_name} value={list.list_name}>
              {list.list_name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Email Template */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Email Template</h2>
        <select
          value={selectedTemplate || ""}
          onChange={(e) => handleTemplateChange(Number(e.target.value))}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select a Template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Edit Variables */}
      {Object.keys(variables).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Edit Variables</h2>
          {Object.keys(variables).map((key) => (
            <div key={key} className="mb-2">
              <label className="block font-medium">{key}</label>
              <input
                type="text"
                value={variables[key]}
                onChange={(e) => handleVariableChange(key, e.target.value)}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview Email */}
      <button
        onClick={() => setPreview(!preview)}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
      >
        {preview ? "Hide Preview" : "Show Preview"}
      </button>

      {preview && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Email Preview</h2>
          <div
            dangerouslySetInnerHTML={{ __html: emailContent.replace(/{{(.*?)}}/g, (_, key) => variables[key] || "") }}
            className="border p-3 rounded-lg bg-gray-100"
          />
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSendEmail}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        disabled={sending}
      >
        {sending ? "Sending..." : "Send Email"}
      </button>
    </div>
  );
}