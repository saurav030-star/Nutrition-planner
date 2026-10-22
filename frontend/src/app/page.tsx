"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  PieChart, 
  FileText, 
  Gauge, 
  CheckCircle2, 
  Flame, 
  ShoppingCart 
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>OJT Capstone Project | FoodTech Sector Automation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
          Enterprise-Grade Autonomous{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            AI Nutrition Planner
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Transitioning from brittle single-prompt LLMs to a resilient, stateful 
          <b> LangGraph multi-agent architecture</b>. Automating clinical BMR/TDEE calculation, 
          macro-nutrient optimization, allergen safety shields, and grocery aisle routing.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/planner"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition"
          >
            <span>Launch Multi-Agent Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 shadow-sm transition"
          >
            <span>Open Tracking Dashboard</span>
          </Link>
          <Link
            href="/benchmark"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition"
          >
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>TaskBench Suite</span>
          </Link>
        </div>

        {/* Quick Academic Meta Pill */}
        <div className="mt-12 pt-8 border-t border-slate-200 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Students</span>
            <span className="text-xs font-semibold text-slate-900">Saurav Sharma & Nitish Kumar</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Registration</span>
            <span className="text-xs font-semibold text-slate-900">251810700281 / 251810700125</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Program</span>
            <span className="text-xs font-semibold text-slate-900">B.Tech CSE (AI/ML) 2025–2029</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Core Frameworks</span>
            <span className="text-xs font-semibold text-slate-900">LangGraph • FastAPI • Next.js</span>
          </div>
        </div>
      </section>

      {/* 4 Core Must-Have Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Four Core Architectural Must-Haves
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered according to the OJT Project Design Specifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Autonomous Multi-Agent Engine</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              LangGraph StateGraph separating duties into Profile Analyzer, Macro Optimizer, Recipe Generator, and Constraint Verifier with automated retry loops.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Secure CRUD & Persistence</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              JWT-based authentication, bcrypt hashing, and persistent relational storage across Users, Dietary Profiles, Meal Plans, and Daily Nutrition Logs.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Interactive Analytics Dashboard</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Real-time macro-nutrient tracking (carbs, proteins, fats, calories) using interactive Recharts and server-state synchronization with React Query.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">4. TaskBench Evaluation Suite</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Automated testing suite assessing constraint adherence (&gt;85% target, 100% achieved), allergen shields, and millisecond execution times.
            </p>
          </div>
        </div>
      </section>

      {/* Stretch Goals Realized */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Stretch Goals Delivered
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-slate-100">
              Commercial Supermarket Aisle Routing & ReportLab PDF Export
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Automating operational overhead for FoodTech businesses by compiling weekly meal plans into downloadable publication-quality PDF documents and organizing ingredients into supermarket fulfillment zones.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/grocery"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Explore Aisle Grocery List</span>
              </Link>
              <Link
                href="/planner"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Generate & Download PDF</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
