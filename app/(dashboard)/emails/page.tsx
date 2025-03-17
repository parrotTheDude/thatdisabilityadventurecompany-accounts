"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface EmailTemplate {
  id: number;
  name: string;
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/emails/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(res.data);
    } catch (err) {
      setError("Failed to load email templates.");
    } finally {
      setLoading(false);
    }
  };


  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Email Templates</h1>

      {/* Success Message */}
      {success && (
          <p className="text-green-600 mb-4 bg-green-100 p-2 rounded-md">
            ✔ Email template saved successfully!
          </p>
        )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add Template Button */}
      <button
        onClick={() => router.push("/emails/add-template")}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
      >
        Add Template
      </button>

      {/* Email Templates List */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Available Templates</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Template Name</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-t">
                  <td className="p-3">{template.name}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => router.push(`/emails/edit/${template.id}`)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                    >
                      Edit
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