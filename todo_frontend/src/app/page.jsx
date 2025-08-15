


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store/authStore";
import { useTodoStore } from "./store/todoStore";
import TaskForm from "./components/TaskForm";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, bootstrapped, bootstrap } = useAuthStore();
  const { tasks, updateTask, fetchTasks, deleteTask, enhanceTask, bulkAI, loading } = useTodoStore();

  const [editTask, setEditTask] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [enhancingTaskId, setEnhancingTaskId] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);

  useEffect(() => {
    if (!bootstrapped) bootstrap();
  }, [bootstrapped, bootstrap]);

  useEffect(() => {
    if (bootstrapped && !isAuthenticated) router.push("/login");
    if (bootstrapped && isAuthenticated) fetchTasks();
  }, [bootstrapped, isAuthenticated, router, fetchTasks]);

  const onBulk = async () => {
    setBulkLoading(true);
    await bulkAI();
    setBulkLoading(false);
    toast.success("AI bulk enhancement applied!");
  };

  const handleEditSubmit = async () => {
    if (!editTask.title.trim()) return toast.error("Title cannot be empty");
    try {
      await updateTask(editTask.id, {
        title: editTask.title,
        description: editTask.description,
        category: editTask.category,
        deadline: editTask.deadline,
      });
      setEditTask(null);
      toast.success("Task updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    }
  };

  const handleAIEnhance = async (task) => {
    setEnhancingTaskId(task.id);
    try {
      await enhanceTask(task.id);
      toast.success("Task enhanced!");
    } catch (err) {
      console.error(err);
      toast.error("Enhancement failed");
    } finally {
      setEnhancingTaskId(null);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      setCompletingTaskId(taskId);
      await updateTask(taskId, { status: "completed" });
      await fetchTasks();
      toast.success("Task marked as completed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete task");
    } finally {
      setCompletingTaskId(null);
    }
  };


  if (!bootstrapped) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 ">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-gray-800">📋 Dashboard</h1>
          <button
            onClick={onBulk}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium shadow-md hover:scale-105 active:scale-95 transform transition-all duration-200"
          >
            {bulkLoading ? "🤖 AI Suggesting..." : "✨ AI Bulk Suggest"}
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <TaskForm />
        </div>

        {loading && (
          <div className="text-center text-gray-500 animate-pulse">Loading tasks…</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(tasks) && tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border ${task.status === 'completed' ? 'opacity-70' : ''
                }`}
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    📅 {task.deadline || "No deadline"} | 🏷 {task.category_name || "Uncategorized"} | Status: {task.status || "pending"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {task.status !== "completed" && (
                    <>
                      <button
                        onClick={() => handleAIEnhance(task)}
                        disabled={enhancingTaskId === task.id}
                        className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium hover:bg-yellow-500 transition disabled:opacity-50"
                      >
                        {enhancingTaskId === task.id ? "Enhancing…" : "✨ AI Enhance"}
                      </button>
                      <button
                        onClick={() => setEditTask(task)}
                        className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={completingTaskId === task.id}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                      >
                        {completingTaskId === task.id ? "Marking…" : "✅ Complete"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && !loading && (
            <div className="text-center text-gray-600 bg-white p-4 rounded-lg shadow-sm md:col-span-2">
              No tasks yet. Add one above. 🚀
            </div>
          )}
        </div>
      </div>

      {/* for editing the task */}
      {editTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl w-[500px] shadow-2xl transform scale-100 animate-slideUp">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">✏️ Edit Task</h2>
            <input
              className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              placeholder="Title"
            />
            <textarea
              className="border p-2 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={editTask.description}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              placeholder="Description"
            />
            <input
              type="date"
              className="border p-2 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              value={editTask.deadline || ""}
              onChange={(e) => setEditTask({ ...editTask, deadline: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition-all"
              >
                💾 Save
              </button>
              <button
                onClick={() => setEditTask(null)}
                className="bg-gray-400 text-white px-5 py-2 rounded-full shadow hover:bg-gray-500 transition-all"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
