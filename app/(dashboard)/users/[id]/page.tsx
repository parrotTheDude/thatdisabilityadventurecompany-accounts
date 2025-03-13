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
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [subscriptionLists, setSubscriptionLists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchUserTypes();
    fetchSubscriptionLists();
    fetchGenders();
    console.log("🔍 Current User State:", id);
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const userData = res.data;
  
      // ✅ Ensure subscriptions are initialized properly
      userData.subscriptions = Array.isArray(userData.subscriptions)
        ? userData.subscriptions.map((sub: { list_name: string; subscribed: boolean }) => ({
            list_name: sub.list_name,
            subscribed: Boolean(sub.subscribed), // Ensure it's always a boolean
          }))
        : subscriptionLists.map((list) => ({ list_name: list, subscribed: false })); // Fallback
  
      console.log("🔍 User Data Fetched:", userData); // ✅ Debugging log
  
      setUser(userData);
    } catch (err) {
      setError("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserTypes(res.data.map((item: { user_type: string }) => item.user_type));
    } catch (err) {
      setError("Failed to load user types.");
    }
  };

  const fetchSubscriptionLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/subscriptions/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptionLists(res.data.map((item: { list_name: string }) => item.list_name));
    } catch (err) {
      setError("Failed to load subscription lists.");
    }
  };

  const fetchGenders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/genders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setGenderOptions(res.data); // ✅ Now dynamically setting gender options
    } catch (err) {
      setError("Failed to load gender options.");
    }
  };

  // ✅ Update Input Fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubscriptionChange = (list_name: string) => {
    if (!user) return;
  
    setUser((prev) => {
      if (!prev) return prev;
  
      // ✅ Ensure subscriptions are properly toggled
      let updatedSubscriptions = prev.subscriptions.map((sub) =>
        sub.list_name === list_name ? { ...sub, subscribed: !sub.subscribed } : sub
      );
  
      // ✅ If subscription doesn't exist, add it
      if (!updatedSubscriptions.some((sub) => sub.list_name === list_name)) {
        updatedSubscriptions.push({ list_name, subscribed: true });
      }
  
      console.log("✅ Updated Subscriptions:", updatedSubscriptions); // ✅ Debugging log
  
      return { ...prev, subscriptions: updatedSubscriptions };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
  
    try {
      console.log("🔍 Sending updated user data:", user);
  
      const token = localStorage.getItem("token");
  
      // ✅ Extract only list names of subscribed subscriptions
      const formattedUser = {
        ...user,
        subscriptions: user.subscriptions
          .filter((sub) => sub.subscribed)
          .map((sub) => sub.list_name),
      };
  
      console.log("📤 Final Payload:", formattedUser); // ✅ Log final request data
  
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, formattedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setSuccessMessage("✔ Updates applied successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("❌ Failed to update user:", err);
      setError("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit User</h1>

      {successMessage && (
        <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded-md">{successMessage}</p>
      )}

      {loading && <p>Loading user details...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Name & Email */}
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="First Name"
              value={user.name}
              onChange={handleInputChange}
              className="border p-2 w-full rounded-md"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={user.last_name}
              onChange={handleInputChange}
              className="border p-2 w-full rounded-md"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              disabled
              className="border p-2 w-full rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* User Type Dropdown */}
          <select
            name="user_type"
            value={user.user_type}
            onChange={handleInputChange}
            className="border p-2 w-full rounded-md mt-4"
          >
            <option value="">Select User Type</option>
            {userTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Gender Dropdown */}
          <select
            name="gender"
            value={user.gender}
            onChange={handleInputChange}
            className="border p-2 w-full rounded-md mt-4"
          >
            <option value="">Select Gender (Optional)</option>
            {genderOptions.map((gender: string) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>

          {/* Subscription Lists */}
          <div className="border p-4 rounded-md bg-gray-50 mt-4">
            <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
            {subscriptionLists.length > 0 ? (
              subscriptionLists.map((list) => {
                // ✅ Ensure checkboxes correctly reflect subscription state
                const isSubscribed = user?.subscriptions?.some((sub) => sub.list_name === list && sub.subscribed);

                return (
                  <label key={list} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isSubscribed} // ✅ Ensure it's always a boolean
                      onChange={() => handleSubscriptionChange(list)}
                      className="mr-2 cursor-pointer"
                    />
                    {list}
                  </label>
                );
              })
            ) : (
              <p className="text-gray-500">No available subscriptions.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => router.push("/users")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}