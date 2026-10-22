"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, removeAuthToken, getStoredUser } from "@/lib/api";
import { 
  Sparkles, 
  LayoutDashboard, 
  ChefHat, 
  ShoppingCart, 
  Gauge, 
  LogOut, 
  UserCircle 
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (token) {
      setUser(getStoredUser() || { email: "Demo User", full_name: "Saurav Sharma" });
    }
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "AI Planner (LangGraph)", icon: ChefHat },
    { href: "/grocery", label: "Grocery & PDF Export", icon: ShoppingCart },
    { href: "/benchmark", label: "TaskBench Benchmarks", icon: Gauge },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Academic Sub-banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center flex flex-wrap justify-center items-center gap-x-4 border-b border-slate-800">
        <span className="font-semibold text-emerald-400">Enterprise AI Nutrition Planner</span>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span>B.Tech CSE (AI/ML) 2025–2029</span>
        <span className="hidden sm:inline text-slate-600">|</span>
        <span className="text-slate-200">Developers: Saurav Sharma (251810700281) & Nitish Kumar (251810700125)</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 hover:opacity-90 transition">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-emerald-600 font-extrabold tracking-tight">Nutri</span>
            <span className="text-slate-900 font-bold">Graph AI</span>
            <span className="block text-[10px] text-slate-500 font-medium leading-none -mt-0.5">Autonomous Nutrition</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900">{user.full_name || user.email}</span>
                <span className="text-[10px] text-emerald-600 font-medium">Active Profile</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
