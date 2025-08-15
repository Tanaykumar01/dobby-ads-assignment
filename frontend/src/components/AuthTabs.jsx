// src/components/AuthTabs.jsx
function AuthTabs({ currentView, setCurrentView }) {
  return (
    <div className="flex mb-6">
      <button
        onClick={() => setCurrentView("login")}
        className={`flex-1 py-2 px-4 rounded-l-lg font-medium ${
          currentView === "login"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setCurrentView("signup")}
        className={`flex-1 py-2 px-4 rounded-r-lg font-medium ${
          currentView === "signup"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}

export default AuthTabs;