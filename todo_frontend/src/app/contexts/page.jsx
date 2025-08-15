"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import api from "@/utils/api";
import toast from "react-hot-toast";
import SkeletonLoader from "../components/SkeletonLoader";

export default function ContextsPage() {
  const [contexts, setContexts] = useState([]);
  const [form, setForm] = useState({ content: "", source_type: "note", id: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contexts/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setContexts(data);
    } catch (err) {
      // console.error(err);
      toast.error("Failed to load context history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return toast.error("Please enter content");
    setSubmitting(true);
    try {
      if (form.id) {
        const res = await api.put(`/contexts/${form.id}/`, {
          content: form.content.trim(),
          source_type: form.source_type,
        });
        setContexts((prev) => prev.map((c) => (c.id === form.id ? res.data : c)));
        toast.success("Context updated");
      } else {
        const res = await api.post("/contexts/", { ...form, content: form.content.trim() });
        setContexts((prev) => [res.data, ...prev]);
        toast.success("Context added");
      }
      setForm({ content: "", source_type: "note", id: null });
    } catch (err) {
      // console.error(err);
      toast.error("Failed to save context");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c) => setForm({ content: c.content, source_type: c.source_type, id: c.id });
  const handleDelete = async (id) => {
    if (!confirm("Delete this context?")) return;
    try {
      await api.delete(`/contexts/${id}/`);
      setContexts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Context deleted");
    } catch {
      toast.error("Failed to delete context");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Daily Context</h1>

        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
            Paste WhatsApp message / email excerpt / note
          </label>
          <textarea
            id="content"
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
            placeholder="Enter content here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            disabled={submitting}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <select
              value={form.source_type}
              onChange={(e) => setForm({ ...form, source_type: e.target.value })}
              className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
              disabled={submitting}
            >
              <option value="note">Note</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className={`mt-3 sm:mt-0 px-6 py-3 rounded-md font-semibold text-white shadow-md transition ${submitting ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                }`}
            >
              {submitting ? (form.id ? "Updating..." : "Adding...") : form.id ? "Update Context" : "Add Context"}
            </button>
          </div>
        </form>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Context History</h2>
          {loading ? (
            <SkeletonLoader />
          ) : contexts.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
              No context entries yet.
            </div>
          ) : (
            <div className="space-y-4">
              {contexts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 font-medium tracking-wide mb-1">
                      {c.source_type.charAt(0).toUpperCase() + c.source_type.slice(1)} •{" "}
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap break-words">{c.content}</p>
                    {c.processed_insights && (
                      <pre className="mt-3 bg-gray-50 p-3 rounded text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(c.processed_insights, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-4 py-2 rounded-md bg-yellow-400 font-semibold text-gray-900 hover:bg-yellow-500 transition"
                      aria-label={`Edit context created on ${new Date(c.created_at).toLocaleString()}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-4 py-2 rounded-md bg-red-600 font-semibold text-white hover:bg-red-700 transition"
                      aria-label={`Delete context created on ${new Date(c.created_at).toLocaleString()}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

