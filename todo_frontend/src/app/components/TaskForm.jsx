
"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, Tag, FileText, AlertCircle } from "lucide-react";
import { useTodoStore } from "../store/todoStore";



export default function TaskForm() {
  const { addTask, categories, fetchCategories } = useTodoStore();
  const [form, setForm] = useState({ title: "", description: "", category: "", deadline: "" });
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const submit = async () => {
    setErr("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description || "",
      };
      if (form.category) payload.category = Number(form.category);
      if (form.deadline) payload.deadline = form.deadline;

      await addTask(payload);
      setForm({ title: "", description: "", category: "", deadline: "" });

    } catch (error) {
      setErr(error?.response?.data ? JSON.stringify(error.response.data) : error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      1: "bg-blue-50 text-blue-700 border-blue-200",
      2: "bg-green-50 text-green-700 border-green-200",
      3: "bg-red-50 text-red-700 border-red-200",
      4: "bg-purple-50 text-purple-700 border-purple-200"
    };
    return colors[categoryId] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl  border border-white/20 p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-2">
          Create New Task
        </h2>
        <p className="text-slate-600">Add a new task to your workflow</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <FileText className="w-4 h-4 mr-2 text-slate-500" />
              Task Title
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pl-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              Deadline
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-slate-700">
            <FileText className="w-4 h-4 mr-2 text-slate-500" />
            Description
          </label>
          <textarea
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md resize-none"
            placeholder="Add more details about your task..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Tag className="w-4 h-4 mr-2 text-slate-500" />
              Category
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={isSubmitting || !form.title.trim()}
            className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[140px]"
          >
            <div className="flex items-center justify-center space-x-2">
              <Plus className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
              <span>{isSubmitting ? "Adding..." : "Add Task"}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
          </button>
        </div>

        {form.category && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Selected:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(Number(form.category))}`}>
              {categories.find(c => c.id === Number(form.category))?.name}
            </span>
          </div>
        )}

        {err && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{err}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Fields completed: {Object.values(form).filter(Boolean).length}/4</span>
          <span>Required: Title only</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(form).filter(Boolean).length / 4) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}