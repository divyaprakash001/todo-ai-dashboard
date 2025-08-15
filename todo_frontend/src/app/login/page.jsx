"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, bootstrapped, bootstrap } = useAuthStore();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!bootstrapped) bootstrap();
  }, [bootstrapped, bootstrap]);

  useEffect(() => {
    if (bootstrapped && isAuthenticated) {
      router.push("/");
    }
  }, [bootstrapped, isAuthenticated, router]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(form.username, form.password);
    } catch (error) {
      setErr(
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : "Login failed"
      );
    }
  };

  if (!bootstrapped) return null;

  return (
    <div className="min-h-screen max-w-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-200 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 sm:p-10">
        <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Welcome Back
        </h1>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          {err && <p className="text-red-600 text-sm mt-1">{err}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-md py-3 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          New to this website?{" "}
          <Link href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
