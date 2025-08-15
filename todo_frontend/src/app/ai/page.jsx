"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function AIPage() {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [tasksPreview, setTasksPreview] = useState([]);
  const router = useRouter();

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await api.get("/tasks/");
      setTasksPreview(res.data);
    } catch (err) {
      // console.error(err);
      toast.error("Failed to load tasks preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => { loadPreview(); }, []);

  const runBulk = async () => {
    if (!confirm("Run AI bulk suggestions on all tasks? This may update tasks in your DB.")) return;
    setRunning(true);
    toast.loading("Running AI suggestions...");
    try {
      const res = await api.post("/ai/bulk/", { apply_changes: true });
      setResult(res.data);
      toast.dismiss();
      toast.success("AI suggestions applied");

      router.push("/");
    } catch (err) {
      // console.error(err);
      toast.dismiss();
      toast.error("AI run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">AI Suggestions (Bulk)</h1>
          <button onClick={runBulk} disabled={running} className="px-3 py-2 bg-purple-600 text-white rounded">
            {running ? "Running..." : "Run AI Bulk"}
          </button>
        </div>

        <p className="text-sm text-gray-600">This will analyze your tasks and contexts to suggest priorities, deadlines, and improved descriptions.</p>

        <div className="mt-4">
          <h2 className="text-lg font-medium mb-2">Tasks preview</h2>
          {loadingPreview ? (
            <SkeletonLoader />
          ) : (
            <div className="grid gap-2">
              {tasksPreview.map(t => (
                <div key={t.id} className="bg-white p-3 rounded shadow">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-gray-500">priority {t.priority_score} • deadline {t.deadline || "—"}</div>
                  <div className="mt-1 text-sm">{t.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">AI Result</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
