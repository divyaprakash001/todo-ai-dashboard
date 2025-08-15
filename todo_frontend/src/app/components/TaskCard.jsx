"use client";

import { useState } from "react";


export default function TaskCard({ task, onDelete, onEnhance, onEdit }) {

  const [enhanceLoad, setEnhanceLoad] = useState(false);

  const handleEnhance = async () => {
    setEnhanceLoad(true);
    await onEnhance()
    setEnhanceLoad(false);
  }

  return (
    <>
      <div className="bg-white p-4 rounded shadow flex justify-between items-start flex-col gap-10 md:flex-row">
        <div>
          <div className="font-semibold">{task.title}</div>
          <div className="text-sm text-gray-600 max-w-[700px]">{task.description}</div>
          <div className="text-xs text-gray-500 mt-1">
            Category: {task.category_name || "—"} • Priority: {task.priority_score} • Deadline: {task.deadline || "—"}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleEnhance} className="px-2 cursor-pointer md:px-3 py-1 text-[12px] md:text-[14px] bg-yellow-400 rounded">{enhanceLoad ? "AI Enhancing..." : "AI Enhance"}</button>
          <button onClick={() => onEdit(task)} className="px-2 md:px-3 py-1 text-[12px] md:text-[14px] bg-green-500 text-white rounded">
            Edit
          </button>
          <button onClick={onDelete} className="px-2 md:px-3 py-1 bg-red-600 text-[12px] md:text-[14px] text-white rounded">Delete</button>
        </div>
      </div>

    </>

  );
}
