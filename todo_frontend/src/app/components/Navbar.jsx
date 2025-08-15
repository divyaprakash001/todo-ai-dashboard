"use client";
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import DarkModeToggle from './DarkModeToggle';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, logout, login } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md text-gray-800 dark:text-white p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">
          <Link href="/">
            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer">Smart Todo</span>
          </Link>
        </div>

        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/">
            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition px-3 py-2 rounded-md cursor-pointer">Home</span>
          </Link>
          <Link href="/dashboard">
            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition px-3 py-2 rounded-md cursor-pointer">Dashboard</span>
          </Link>
          <Link href="/categories">
            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition px-3 py-2 rounded-md cursor-pointer">Categories</span>
          </Link>
          <Link href="/contexts">
            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition px-3 py-2 rounded-md cursor-pointer">Contexts</span>
          </Link>
          <DarkModeToggle />
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          ) : (
            <Link
              href={"/login"}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <DarkModeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-3 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-2 space-y-2 px-2 pt-2 pb-4 bg-white dark:bg-gray-800 rounded-md shadow-lg">
          <Link href="/">
            <span onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-700 transition cursor-pointer">
              Home
            </span>
          </Link>
          <Link href="/dashboard">
            <span onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-700 transition cursor-pointer">
              Dashboard
            </span>
          </Link>
          <Link href="/categories">
            <span onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-700 transition cursor-pointer">
              Categories
            </span>
          </Link>
          <Link href="/contexts">
            <span onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-700 transition cursor-pointer">
              Contexts
            </span>
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                login();
                setMenuOpen(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
