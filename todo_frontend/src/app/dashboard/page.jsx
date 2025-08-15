

"use client";
import ProtectedRoute from '../components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useAuthStore } from "../store/authStore";
import { useTodoStore } from "../store/todoStore";
import Filters from '../components/Filters';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { isAuthenticated, bootstrapped, bootstrap } = useAuthStore();
  const {
    tasks,
    loading,
    fetchTasks,
    updateTask,
    deleteTask,
    enhanceTask,
    bulkAI,
  } = useTodoStore();

  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', deadline: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [enhancingTaskId, setEnhancingTaskId] = useState(null);
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!bootstrapped) bootstrap();
  }, [bootstrapped, bootstrap]);

  useEffect(() => {
    if (bootstrapped && !isAuthenticated) {
      window.location.href = "/login";
    }
    if (bootstrapped && isAuthenticated) {
      fetchTasks();
    }
  }, [bootstrapped, isAuthenticated, fetchTasks]);

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline || '',
      category: task.category || ''
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: '', description: '', deadline: '', category: '' });
  };

  const handleUpdate = async (taskId) => {
    if (!editForm.title.trim()) return toast.error("Title required");
    setSubmitting(true);
    try {
      await updateTask(taskId, editForm);
      toast.success("Task updated");
      cancelEdit();
    } catch (err) {
      // console.error(err);
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch (err) {
      // console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleAIEnhance = async (task) => {
    try {
      setEnhancingTaskId(task.id);
      await enhanceTask(task.id);
      toast.success("Task enhanced by AI");
    } catch (err) {
      // console.error(err);
      toast.error("AI enhance failed");
    } finally {
      setEnhancingTaskId(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTaskId(taskId);
      await updateTask(taskId, { status: "completed" });
      toast.success("Task marked as completed");
    } catch (err) {
      // console.error(err);
      toast.error("Failed to mark task as completed");
    } finally {
      setCompletingTaskId(null);
    }
  };



  function getPriorityLabel(priorityNumber) {
    if (priorityNumber <= 10) return "low";
    if (priorityNumber <= 20) return "medium";
    return "high";
  }


  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(task => {
      const priorityLabel = getPriorityLabel(task.priority);
      const statusMatch = !filters.status || (task.status || '').toLowerCase() === filters.status.toLowerCase();
      const priorityMatch = !filters.priority || priorityLabel === filters.priority.toLowerCase();
      return statusMatch && priorityMatch;
    })
    : [];


  if (!bootstrapped) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <Filters filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={async () => {
                setBulkLoading(true);
                try {
                  await bulkAI();
                  toast.success("AI bulk enhancement applied!");
                } catch (err) {
                  toast.error("AI bulk enhancement failed");
                } finally {
                  setBulkLoading(false);
                }
              }}
              disabled={bulkLoading}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium shadow-md hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-60"
            >
              {bulkLoading ? "🤖 AI Suggesting..." : "✨ AI Bulk Suggest"}
            </button>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-md">
              No tasks found. 🚀
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border ${task.status === 'completed' ? 'opacity-70' : ''
                    }`}
                >
                  {editingTaskId === task.id ? (
                    task.status === 'completed' ? (
                      <p className="text-sm text-gray-500 italic">Completed tasks cannot be edited.</p>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                        <textarea
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                        <input
                          type="date"
                          className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
                          value={editForm.deadline}
                          onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={submitting}
                            onClick={() => handleUpdate(task.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow transition"
                          >
                            {submitting ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-gray-400 text-white rounded-full hover:bg-gray-500 shadow transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <h3 className={`text-lg font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title} <span className="text-sm text-gray-500">({getPriorityLabel(task.priority)})</span>

                        </h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          📅 {task.deadline || "No deadline"} | 🏷 {task.category_name || "Uncategorized"} | Status: {task.status || "pending"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {task.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => handleAIEnhance(task)}
                              disabled={enhancingTaskId === task.id}
                              className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium hover:bg-yellow-500 transition disabled:opacity-50"
                            >
                              {enhancingTaskId === task.id ? "Enhancing..." : "✨ AI Enhance"}
                            </button>
                            <button
                              onClick={() => startEdit(task)}
                              className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
                            >
                              ✏ Edit
                            </button>
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={completingTaskId === task.id}
                              className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                            >
                              {completingTaskId === task.id ? "Marking..." : "✅ Complete"}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
