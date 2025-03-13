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
    subscriptions: [] as string[],
  });

  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [subscriptionLists, setSubscriptionLists] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch available user types, subscription lists, and genders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userTypeRes, subRes, genderRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/subscriptions/lists`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/genders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUserTypes(userTypeRes.data.map((item: { user_type: string }) => item.user_type));
        setSubscriptionLists(subRes.data.map((item: { list_name: string }) => item.list_name));
        setGenderOptions(genderRes.data);
      } catch (err) {
        setError("Failed to load user types, subscriptions, or genders.");
      }
    };

    fetchData();
  }, []);

  // ✅ Function to Determine Auto-Subscriptions
  const getAutoSubscriptions = (userType: string, gender: string): string[] => {
    if (["admin", "superadmin", "staff"].includes(userType)) {
      return ["calender-release", "bonus-event", "newsletter", "teens"]; // ✅ Fixed names
    }
    if (["participant", "parent"].includes(userType)) {
      if (gender === "teen") {
        return ["newsletter", "teens"]; // ✅ Fixed names
      }
      return ["calender-release", "bonus-event", "newsletter"]; // ✅ Fixed names
    }
    if (userType === "external") {
      return ["newsletter"]; // ✅ Fixed names
    }
    return [];
  };

  // ✅ Handle Input Change (For Text Inputs)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === "name" || name === "last_name") {
      value = value.charAt(0).toUpperCase() + value.slice(1); // Auto-Capitalize
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Select Change (For Dropdowns)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "user_type") {
      handleUserTypeChange(e); // ✅ Calls correct handler
    } else if (name === "gender") {
      handleGenderChange(e); // ✅ Calls correct handler
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Auto-Select Subscriptions Based on User Type
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      user_type: selectedType,
      subscriptions: getAutoSubscriptions(selectedType, prev.gender), // ✅ Auto-update subscriptions
    }));
  };

  // ✅ Auto-Update Subscriptions When Gender Changes
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGender = e.target.value;
    setFormData((prev) => ({
      ...prev,
      gender: selectedGender,
      subscriptions: getAutoSubscriptions(prev.user_type, selectedGender), // ✅ Auto-update subscriptions
    }));
  };

  // ✅ Toggle Subscription Selection
  const handleSubscriptionChange = (list_name: string) => {
    setFormData((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.includes(list_name)
        ? prev.subscriptions.filter((sub) => sub !== list_name)
        : [...prev.subscriptions, list_name],
    }));
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Store success message in sessionStorage
    sessionStorage.setItem(
      "newUserMessage",
      JSON.stringify({ name: formData.name, email: formData.email })
    );

      router.push("/users"); // ✅ Redirect after creation
    } catch (err) {
      setError("Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New User</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        {/* First Name Input */}
        <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleInputChange} className="border p-2 w-full rounded-md" />

        {/* Last Name Input */}
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} className="border p-2 w-full rounded-md" />

        {/* Email Input */}
        <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} className="border p-2 w-full rounded-md" />

        {/* User Type Dropdown */}
        <select name="user_type" required value={formData.user_type} onChange={handleUserTypeChange} className="border p-2 w-full rounded-md">
          <option value="">Select User Type</option>
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        {/* Gender Dropdown */}
        <select name="gender" value={formData.gender} onChange={handleGenderChange} className="border p-2 w-full rounded-md">
          <option value="">Select Gender (Optional)</option>
          {genderOptions.map((gender) => (
            <option key={gender} value={gender}>
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </option>
          ))}
        </select>

        {/* Subscription Lists */}
        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
          {subscriptionLists.map((list) => (
            <label key={list} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.subscriptions.includes(list)} // ✅ Auto-check based on logic
                onChange={() => handleSubscriptionChange(list)}
                className="mr-2"
              />
              {list}
            </label>
          ))}
        </div>

        {/* Submit Button */}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded-md hover:bg-blue-600 transition">
          {loading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  );
}