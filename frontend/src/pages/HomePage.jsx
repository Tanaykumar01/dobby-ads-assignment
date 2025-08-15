// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import AuthTabs from "../components/AuthTabs";
import AuthForm from "../components/AuthForm";
import { checkUserLogin } from "../api/auth.js"; 

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const currentUser = await checkUserLogin();
        setUser(currentUser);
        if(currentUser) navigate("/dashboard");
      } catch (err) {
        console.error("Login check failed:", err);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Image Organizer</h1>
          <p className="text-gray-600 mt-2">Organize your images in folders</p>
        </div>

        {/* Tabs */}
        <AuthTabs currentView={currentView} setCurrentView={setCurrentView} />

        {/* Form */}
        <AuthForm currentView={currentView} />
      </div>
    </div>
  );
}
