"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    setError("");
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to sign up");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="cozy-card w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Sign Up for Krsna
        </h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
