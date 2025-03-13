"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  user_type: string;
  gender: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [currentUser, setCurrentUser] = useState<{ id: number; user_type: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ name: string; email: string } | null>(
    null
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserType(e.target.value || null);
  };
  
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value || null);
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Redirect if not master, superadmin, or admin
      if (!["master", "superadmin", "admin"].includes(res.data.user_type)) {
        router.push("/dashboard"); // Redirect unauthorized users
      }

      setCurrentUser(res.data);
    } catch (err) {
      setError("Unauthorized. Redirecting...");
      router.push("/dashboard");
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!currentUser) return; // ✅ Ensure `currentUser` is set before filtering
  
      // ✅ Hide users that are above the current user's hierarchy
      const accessibleUsers = res.data.filter((user: User) =>
        canManageUser(currentUser.user_type, user.user_type)
      );
  
      console.log("👀 Visible Users:", accessibleUsers); // ✅ Debug log
  
      setUsers(accessibleUsers);
      setFilteredUsers(accessibleUsers);
      setDisplayedUsers(accessibleUsers.slice(0, 20));
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchUserTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserTypes(res.data.map((type: { user_type: string }) => type.user_type));
    } catch (err) {
      setError("Failed to load user types.");
    }
  }, []);

  const fetchGenders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/genders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenders(res.data);
    } catch (err) {
      setError("Failed to load gender options.");
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchUserTypes();
      fetchGenders();
    }
  
    // ✅ Retrieve and remove the success message from sessionStorage
    const message = sessionStorage.getItem("newUserMessage");
    if (message) {
      setSuccessMessage(JSON.parse(message));
      sessionStorage.removeItem("newUserMessage"); // ✅ Remove after displaying
    }
  }, [currentUser]);

  // ✅ Filter users by search, user type, and gender
  useEffect(() => {
    if (!users.length) return; // ✅ Prevent running when users aren't loaded
  
    let searchedUsers = users; // ✅ Start with the full list
  
    if (search) {
      searchedUsers = searchedUsers.filter((user) =>
        `${user.name} ${user.last_name} ${user.email} ${user.user_type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
  
    if (selectedUserType) {
      searchedUsers = searchedUsers.filter((user) => user.user_type === selectedUserType);
    }
  
    if (selectedGender) {
      searchedUsers = searchedUsers.filter((user) => user.gender === selectedGender);
    }
  
    console.log("🔍 Filtered Users:", searchedUsers); // ✅ Debug log
  
    setFilteredUsers(searchedUsers);
    setDisplayedUsers(searchedUsers.slice(0, visibleCount)); // ✅ Update displayed users
  }, [search, selectedUserType, selectedGender, users, visibleCount]);

  // ✅ Capitalize first letter of labels
  const capitalize = (text: string | null | undefined) => {
    if (!text) return "N/A";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // ✅ Load More Users
  const loadMoreUsers = () => {
    setVisibleCount((prev) => prev + 20);
  };

  // ✅ Download CSV of filtered users
  const downloadFilteredCSV = () => {
    if (filteredUsers.length === 0) {
      console.warn("⚠ No users to download.");
      return;
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["First Name,Last Name,Email,User Type,Gender", ...filteredUsers.map((user) =>
        `${user.name},${user.last_name},${user.email},${user.user_type},${user.gender}`
      )].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", "filtered_users.csv");
    document.body.appendChild(link);
    link.click();
  };

  // ✅ Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedUserType(null);
    setSelectedGender(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Management</h1>

      {/* ✅ Success Message */}
      {successMessage && (
        <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded-md">
          ✔ New User Added: {successMessage.name} ({successMessage.email})
        </p>
      )}

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

      {/* Filters & Buttons */}
      <div className="flex justify-between items-center mb-4 p-3 bg-white shadow-md rounded-lg">
        <div className="flex space-x-4">
          {/* User Type Dropdown */}
          <select
            value={selectedUserType || ""}
            onChange={(e) => setSelectedUserType(e.target.value || null)}
            className="border p-3 rounded-lg w-48 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All User Types</option>
            {userTypes.map((type) => (
              <option key={type} value={type}>
                {capitalize(type)}
              </option>
            ))}
          </select>

          {/* Gender Dropdown */}
          <select
            value={selectedGender || ""}
            onChange={(e) => setSelectedGender(e.target.value || null)}
            className="border p-3 rounded-lg w-48 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Genders</option>
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {capitalize(gender)}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          <button onClick={resetFilters} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md">
            Reset Filters
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button onClick={downloadFilteredCSV} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow-md">
            Download CSV
          </button>
          <button onClick={() => router.push("/users/create")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            Add New User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {displayedUsers.length > 0 ? (
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">First Name</th>
                <th className="p-3 text-left">Last Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">User Type</th>
                <th className="p-3 text-left">Gender</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t transition cursor-pointer hover:bg-gray-100"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  <td className="p-3">{capitalize(user.name)}</td>
                  <td className="p-3">{capitalize(user.last_name)}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{capitalize(user.user_type)}</td>
                  <td className="p-3">{capitalize(user.gender)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center p-4">No users found.</p>
        )}
      </div>

      {/* Show More Button */}
      {filteredUsers.length > visibleCount && (
        <div className="flex justify-center mt-4">
          <button onClick={loadMoreUsers} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            Show More
          </button>
        </div>
      )}
    </div>
  );
}

const canManageUser = (currentUserType: string, targetUserType: string) => {
  const hierarchy = ["admin", "superadmin", "master"]; // ✅ Correct order of hierarchy

  return hierarchy.indexOf(currentUserType) >= hierarchy.indexOf(targetUserType); // ✅ Allow managing same-level users
};