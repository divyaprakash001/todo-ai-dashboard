
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "@/utils/api";
import toast from "react-hot-toast";
import SkeletonLoader from "../components/SkeletonLoader";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", id: null });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories/");
      setCategories(res.data.results);
    } catch (err) {
      // console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name cannot be empty");
    setSubmitting(true);
    try {
      if (form.id) {
        const res = await api.put(`/categories/${form.id}/`, { name: form.name.trim() });
        setCategories((prev) => prev.map((c) => (c.id === form.id ? res.data : c)));
        toast.success("Category updated");
      } else {
        const res = await api.post("/categories/", { name: form.name.trim() });
        setCategories((prev) => [res.data, ...prev]);
        toast.success("Category added");
      }
      setForm({ name: "", id: null });
    } catch (err) {
      // console.error(err);
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => setForm({ name: cat.name, id: cat.id });

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}/`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (err) {
      // console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Categories</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row gap-4 sm:items-center"
        >
          <input
            type="text"
            className="border border-gray-300 rounded-md p-3 flex-grow focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 rounded-md text-white font-semibold shadow-md transition ${submitting
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            {submitting ? "Saving..." : form.id ? "Update" : "Add"}
          </button>
        </form>

        {loading ? (
          <SkeletonLoader />
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 bg-white p-10 rounded-lg shadow">
            No categories yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white flex justify-between items-center p-5 rounded-lg shadow hover:shadow-lg transition"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-800">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1">Used {cat.usage_frequency} times</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-4 py-2 bg-yellow-400 rounded-md font-medium text-gray-900 hover:bg-yellow-500 transition"
                    aria-label={`Edit category ${cat.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-4 py-2 bg-red-600 rounded-md font-medium text-white hover:bg-red-700 transition"
                    aria-label={`Delete category ${cat.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
