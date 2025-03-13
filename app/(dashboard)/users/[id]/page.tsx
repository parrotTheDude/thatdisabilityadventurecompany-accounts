"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "axios";

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  user_type: string;
  gender: string;
  subscriptions: { list_name: string; subscribed: boolean }[];
}

export default function UserDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Details</h1>

      {loading && <p>Loading user details...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {user && (
        <div className="border p-6 rounded-lg shadow-md">
          <p className="text-lg"><strong>First Name:</strong> {user.name}</p>
          <p className="text-lg"><strong>Last Name:</strong> {user.last_name}</p>
          <p className="text-lg"><strong>Email:</strong> {user.email}</p>
          <p className="text-lg"><strong>User Type:</strong> {user.user_type}</p>
          <p className="text-lg"><strong>Gender:</strong> {user.gender || "N/A"}</p>

          <h3 className="text-xl font-semibold mt-4">Subscriptions</h3>
          <ul className="list-disc pl-5">
            {user.subscriptions.length > 0 ? (
              user.subscriptions.map((sub) => (
                <li key={sub.list_name} className={sub.subscribed ? "text-green-600" : "text-red-600"}>
                  {sub.list_name} {sub.subscribed ? "(Subscribed)" : "(Not Subscribed)"}
                </li>
              ))
            ) : (
              <p className="text-gray-500">No subscriptions</p>
            )}
          </ul>

          <button onClick={() => router.push("/dashboard/users")} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Back to Users
          </button>
        </div>
      )}
    </div>
  );
}