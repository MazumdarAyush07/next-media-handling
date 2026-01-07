"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Home, User } from "lucide-react";
import { useNotification } from "./Notification";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      showNotification("Signed out successfully", "success");
      setOpen(false);

      router.replace("/login");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-800 font-bold text-lg
                     hover:text-blue-600 transition"
          onClick={() =>
            showNotification("Welcome to ImageKit ReelsPro", "info")
          }
        >
          <Home className="w-5 h-5" />
          Video with AI
        </Link>

        {/* Right Section */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 transition
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl
                         shadow-lg border border-gray-200 overflow-hidden"
            >
              {session ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-600">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  <Link
                    href="/upload"
                    onClick={() => {
                      showNotification(
                        "Welcome to Admin Dashboard",
                        "info"
                      );
                      setOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700
                               hover:bg-gray-100 transition"
                  >
                    Video Upload
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm
                               text-red-600 hover:bg-gray-100 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => {
                    showNotification(
                      "Please sign in to continue",
                      "info"
                    );
                    setOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700
                             hover:bg-gray-100 transition"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
