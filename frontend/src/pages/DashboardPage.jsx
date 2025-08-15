import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ImageIcon,
  User,
  LogOut,
  ChevronRight,
  FolderPlus,
  Upload,
  ArrowLeft,
  Search,
  Folder,
  Trash2,
} from "lucide-react";
import { checkUserLogin } from "../api/auth.js";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

function DashboardPage() {
  // User info
  const [user, setUser] = useState(null);

  // Folder & navigation state
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);

  // Data
  const [folders, setFolders] = useState([]);
  const [parentFolder, setParentFolder] = useState([]);
  const [images, setImages] = useState([]);

  // UI state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadForm, setUploadForm] = useState({ name: "", image: null });
  const [searchQuery, setSearchQuery] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // console.log("searchQuery:", searchQuery);

  // Filtered images
  // const filteredImages = images.filter((img) =>
  //   img.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // Navigation
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const currentUser = await checkUserLogin();
        setUser(currentUser);
        // console.log("Current user:", currentUser);
        navigate("/dashboard");
      } catch (err) {
        console.error("Login check failed:", err);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  // Handlers
  const handleLogout = async () => {
    try {
      await api.post(
        "/api/v1/users/logout",
        {},
        { withCredentials: true } // ensures cookies are sent
      );
      setUser(null);
      navigate("/");
      // console.log("Logged out");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToBreadcrumbFolder = (index) => {
    if (index === -1) {
      setCurrentFolder(null);
      setBreadcrumb([]);
    } else {
      setCurrentFolder(breadcrumb[index]);
      setBreadcrumb(breadcrumb.slice(0, index + 1));
    }
  };

  const goToParentFolder = () => {
    if (breadcrumb.length > 1) {
      goToBreadcrumbFolder(breadcrumb.length - 2);
    } else {
      goToBreadcrumbFolder(-1);
    }
  };

  const openFolder = (folder) => {
    setCurrentFolder(folder);
    setBreadcrumb([...breadcrumb, folder]);
  };

  const deleteFolder = async (id) => {
    try {
      await api.delete(`/api/v1/folders/${id}`, { withCredentials: true });
      setFolders((prevFolders) => ({
        ...prevFolders,
        data: prevFolders.data.filter((f) => f._id !== id),
      }));
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const deleteImage = async (id) => {
    try {
      await api.delete(`/api/v1/images/${id}`, { withCredentials: true });
      setImages((prevImages) => ({
        ...prevImages,
        data: prevImages.data.filter((img) => img._id !== id),
      }));
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/api/v1/folders",
        { name: folderName, parentId: parentFolder?._id || null }, // send parentId if applicable
        { withCredentials: true }
      );
      // console.log("Folder created:", response.data);
      setFolders((prevFolders) => [
        // console.log(prevFolders),
        ...(prevFolders.data.length > 0 ? prevFolders.data : []),
        response.data,
      ]);

      setFolderName("");
      setShowCreateFolder(false);
      setRefreshTrigger(prev => prev + 1);
      // console.log("Folder created successfully");
    } catch (error) {
      if (error.response) {
        // Backend returned a response (like 409, 400)
        console.error("Error:", error.response.data.message);
      } else {
        console.error("Network or other error:", error.message);
      }
    }
  };

  useEffect(
    () => {
      const fetchFoldersAndImages = async () => {
        try {
          const folderRes = await api.get(
            "/api/v1/folders",
            {
              params: { parentId: currentFolder?._id || null },
              withCredentials: true,
            }
          );
          setFolders(folderRes.data);

          const imageRes = await api.get(
            "/api/v1/images",
            {
              params: { folderId: currentFolder?._id || null },
              withCredentials: true,
            }
          );
          setImages(imageRes.data);

          setParentFolder(currentFolder);
        } catch (err) {
          console.error("Failed to fetch folders/images:", err);
        }
      };

      fetchFoldersAndImages();
    },
    [currentFolder , refreshTrigger]
  );

  const handleUploadImage = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", uploadForm.name);
      formData.append("image", uploadForm.image);
      if (parentFolder?._id) {
        formData.append("folderId", parentFolder._id);
      }

      const response = await api.post(
        "/api/v1/images",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // console.log("Image uploaded:", response.data);

      setImages((prevImages) => [
        ...(prevImages.data?.length > 0 ? prevImages.data : []),
        response.data.data, // uploaded image object from backend
      ]);

      setUploadForm({ name: "", image: null });
      setShowUpload(false);
      setRefreshTrigger(prev => prev + 1);
      // console.log("Image uploaded successfully");
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data.message);
      } else {
        console.error("Network or other error:", error.message);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ImageIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Image Organizer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {user?.data?.username}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => goToBreadcrumbFolder(-1)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              !currentFolder
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Home
          </button>
          {breadcrumb.map((folder, index) => (
            <React.Fragment key={folder._id}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => goToBreadcrumbFolder(index)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  index === breadcrumb.length - 1
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            {currentFolder && (
              <button
                onClick={goToParentFolder}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Folders */}
          {folders?.data?.map((folder) => (
            <div
              key={folder._id}
              className="group bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border hover:border-indigo-200"
              onClick={() => openFolder(folder)}
            >
              <div className="flex items-center justify-between mb-2">
                <Folder className="w-8 h-8 text-blue-500" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p
                className="text-sm font-medium text-gray-900 truncate"
                onClick={() => openFolder(folder)}
              >
                {folder.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(folder.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}

          {/* Images */}
          {images?.data?.map((image) => (
            <div
              key={image._id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border hover:border-indigo-200 overflow-hidden"
            >
              <div className="relative aspect-square">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => deleteImage(image._id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-red-50 rounded-full shadow text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {folders?.data?.length === 0 && images?.data?.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No images found" : "No content yet"}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create a folder or upload some images to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Folder
            </h2>
            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter folder name..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Image
            </h2>
            <form onSubmit={handleUploadImage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter image name..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, image: e.target.files[0] })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
