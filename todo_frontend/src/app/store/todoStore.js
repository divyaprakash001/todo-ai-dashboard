"use client";
import { create } from "zustand";
import axiosInstance from "@/utils/axiosInstance";

export const useTodoStore = create((set, get) => ({
  tasks: [],
  categories: [],
  contexts: [],
  loading: false,

  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    const { data } = await axiosInstance.get("/tasks/", { params: filters });
    // console.log('from fetch task', data);
    set({ tasks: data.results, loading: false });
  },

  fetchCategories: async () => {
    const { data } = await axiosInstance.get("/categories/");
    set({ categories: data.results });
  },

  fetchContexts: async () => {
    const { data } = await axiosInstance.get("/contexts/");
    set({ contexts: data });
  },

  addTask: async (payload) => {
    const { data } = await axiosInstance.post("/tasks/", payload);
    set((s) => ({ tasks: [data, ...(s.tasks || [])] }));
    return data;
  },

  updateTask: async (id, payload) => {
    const { data } = await axiosInstance.patch(`/tasks/${id}/`, payload);
    set((s) => ({ tasks: s.tasks.map(t => t.id === id ? data : t) }));
    return data;
  },

  deleteTask: async (id) => {
    await axiosInstance.delete(`/tasks/${id}/`);
    set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) }));
  },

  enhanceTask: async (id) => {
    const { data } = await axiosInstance.post(`/tasks/${id}/ai-enhance/`);
    set((s) => ({ tasks: s.tasks.map(t => t.id === id ? data.task || data : t) }));
    return data;
  },

  bulkAI: async () => {
    const { data } = await axiosInstance.post("/ai/bulk/", {});
    if (data?.updated_tasks) {
      const map = new Map(data.updated_tasks.map(t => [t.id, t]));
      set((s) => ({ tasks: s.tasks.map(t => map.get(t.id) || t) }));
    } else {
      const all = await axiosInstance.get("/tasks/");
      set({ tasks: all.data });
    }
    return data;
  },

  addContext: async (payload) => {
    const { data } = await axiosInstance.post("/contexts/", payload);
    set((s) => ({ contexts: [data, ...s.contexts] }));
    return data;
  },

  fetchContexts: async () => {
    const { data } = await axiosInstance.get("/contexts/");
    set({ contexts: data });
  },


  addCategory: async (name) => {
    const { data } = await axiosInstance.post("/categories/", { name });
    set((s) => ({ categories: [data, ...s.categories] }));
    return data;
  }
}));
