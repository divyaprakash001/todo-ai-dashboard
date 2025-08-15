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
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>
      <p className="mt-2">New to this website ? <span className="text-blue-700"><Link href={'/register'}>Register</Link></span></p>
    </div>
  );
}
