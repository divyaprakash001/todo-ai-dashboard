"use client";
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { isAuthenticated, logout, login } = useAuthStore();
  return (
    <nav className="bg-gray-100 text-black dark:bg-gray-800 dark:text-white  p-4 flex justify-between">
      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/contexts">Contexts</Link>
      </div>
      <div className='flex justify-between gap-5'>
        <DarkModeToggle />
        {
          isAuthenticated ?
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
            :
            <button onClick={login} className="bg-red-500 px-4 py-2 rounded">Login</button>
        }
      </div>
    </nav>
  );
}
