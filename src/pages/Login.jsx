import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login – you can replace this with actual logic or API
    if (email && password) {
      onLogin();
    } else {
      alert("Please enter credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 dark:text-white">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700">
              <FaUser className="text-gray-500 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent w-full outline-none text-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700">
              <FaLock className="text-gray-500 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-gray-800 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
