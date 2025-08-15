"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import Link from "next/link";


export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, bootstrapped, bootstrap } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [err, setErr] = useState("");

  useEffect(() => { if (!bootstrapped) bootstrap(); }, [bootstrapped, bootstrap]);
  useEffect(() => { if (bootstrapped && isAuthenticated) router.push("/"); }, [bootstrapped, isAuthenticated, router]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register(form.username, form.email, form.password);
      router.push("/login");
    } catch (error) {
      setErr(error?.response?.data ? JSON.stringify(error.response.data) : "Register failed");
    }
  };

  if (!bootstrapped) return null;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Username"
          value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full p-2 border rounded" placeholder="Password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-green-600 text-white py-2 rounded">Create account</button>

      </form>
      <p className="mt-2">Already have an account ? <span className="text-blue-700"><Link href={'/login'}>Login</Link></span></p>
    </div>
  );
}
