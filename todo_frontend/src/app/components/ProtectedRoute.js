"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, bootstrapped, bootstrap } = useAuthStore();

  useEffect(() => { if (!bootstrapped) bootstrap(); }, [bootstrapped, bootstrap]);

  useEffect(() => {
    if (bootstrapped && !isAuthenticated) router.replace("/login");
  }, [bootstrapped, isAuthenticated, router]);

  if (!bootstrapped) return null;
  if (!isAuthenticated) return null;
  return children;
}
