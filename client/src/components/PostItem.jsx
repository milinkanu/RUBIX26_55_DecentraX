import React, { useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "./Navbar";

export function PostItem() {
  const [formData, setFormData] = useState({
    phone: "",
    title: "",
    description: "",
    verify: "",
    category: "",
    city: "",
    area: "",
    landmark: "",
    type: "Found", // Default
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = ["Mobile", "Wallet", "Documents", "Bag", "Keys", "Electronics", "Other"];
  const types = ["Lost", "Found"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !user?.name ||
      !user?.email ||
      !formData.phone ||
      !formData.title ||
      !formData.description ||
      !formData.verify ||
      !formData.category ||
      !formData.city ||
      !formData.area ||
      !formData.type
    ) {
      toast.warning("Please fill all required fields");
      return;
    }


    if (!file) {
      toast.warning("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      // Upload file to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "First_time_using_cloudinary");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dscllest7/image/upload",
        data
      );

      const uploadedFileUrl = cloudinaryRes.data.secure_url;
      setFileUrl(uploadedFileUrl);

      // Send to backend
      const { category, city, area, landmark, type, ...rest } = formData;
      const payload = {
        ...rest,
        category,
        type,
        location: { city, area, landmark },
        name: user.name,
        email: user.email,
        file: uploadedFileUrl,
      };

      await axios.post("http://localhost:5000/api/items", payload);


      toast.success("Item posted successfully!");

      setFormData({
        phone: "",
        title: "",
        description: "",
        verify: "",
        category: "",
        city: "",
        area: "",
        landmark: "",
        type: "Found",
      });

      setFile(null);
      setFileUrl("");
    } catch (err) {
      console.error("Error posting item:", err);
      toast.error("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-10">Post Item</h1>

        <div className="bg-black/80 p-8 rounded-2xl shadow-2xl border border-gray-800">
          <p className="text-gray-400 mb-6">
            Please fill all the required fields
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* User Info Display */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 text-xs sm:text-sm text-gray-300 bg-black/40 border border-dashed border-yellow-400/30 rounded-lg px-3 py-2 sm:px-4 sm:py-2 cursor-default select-none max-w-full">
              <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                <span>👤 Posting as</span>
                <span className="font-semibold text-yellow-400 truncate max-w-[60vw] sm:max-w-none">
                  {user?.name}
                </span>
              </span>
              <span className="text-gray-500 truncate max-w-full">
                ({user?.email})
              </span>
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">I am posting a...</label>
              <div className="flex gap-4">
                {types.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 hover:border-yellow-400 transition-colors">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={formData.type === t}
                      onChange={handleChange}
                      className="text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className={formData.type === t ? "text-yellow-400 font-semibold" : "text-gray-300"}>
                      {t} Item
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
              <input
                type="text"
                name="area"
                placeholder="Area *"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <input
              type="text"
              name="landmark"
              placeholder="Landmark (Optional)"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Contact Phone *"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />

            <input
              type="text"
              name="title"
              placeholder="Item Title *"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />

            <textarea
              name="description"
              placeholder="Item Description *"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />

            <input
              type="text"
              name="verify"
              placeholder="Verification Question (e.g. 'What is the wallpaper?')"
              value={formData.verify}
              onChange={handleChange}
              className="w-full p-3 bg-black border border-gray-700 rounded-md text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />

            {/* File Upload */}
            <label
              htmlFor="file"
              className="flex items-center gap-3 p-3 border border-gray-700 rounded-md cursor-pointer hover:border-yellow-400 transition-colors duration-200"
            >
              <Upload className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-300">
                {file ? file.name : "Choose File *"}
              </span>
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-200"
            >
              {uploading ? "Uploading..." : "POST ITEM"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
