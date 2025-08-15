"use client";

import { useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a name");
    setLoading(true);
    try {
      await api.post("/categories/", { name: name.trim() });
      toast.success("Category created");
      router.push("/categories");
    } catch (err) {
      // console.error(err);
      const msg = err?.response?.data || "Create failed";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Create Category</h1>
        <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
