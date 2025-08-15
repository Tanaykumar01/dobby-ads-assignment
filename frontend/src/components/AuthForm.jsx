// src/components/AuthForm.jsx
import { useState } from "react";
import axios from "axios"; // ✅ Now actually imported
import { useNavigate } from "react-router-dom"; // If you’re using react-router
import api from "../api/axios";

function AuthForm({ currentView }) {
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post(
        "/api/v1/users/login",
        {
          email: authForm.email,
          password: authForm.password,
        },
        { withCredentials: true }
      );
      if (data.statusCode === 200) {
        // alert("Logged in successfully");
        navigate("/dashboard"); // redirect after login
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post(
        "/api/v1/users/register",
        {
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
        },
        { withCredentials: true }
      );
      if (data.statusCode === 200) {
        alert("Account created successfully!");
        setAuthForm({ username: "", email: "", password: "" });
        navigate("/");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={currentView === "login" ? handleLogin : handleSignup}>
      {currentView === "signup" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            required
            value={authForm.username}
            onChange={(e) =>
              setAuthForm({ ...authForm, username: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={authForm.email}
          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={authForm.password}
          onChange={(e) =>
            setAuthForm({ ...authForm, password: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        {currentView === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
}

export default AuthForm;
