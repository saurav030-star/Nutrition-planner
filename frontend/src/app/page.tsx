"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  PieChart, 
  ShieldCheck, 
  ShoppingCart, 
  User, 
  BarChart3, 
  Sprout, 
  Zap 
} from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your AI Nutrition Assistant</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold text-slate-900 tracking-tight leading-[1.14]">
            Enterprise-Grade <br />
            <span className="text-emerald-500">AI</span> Nutrition Planner
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed font-normal">
            Get personalized diet plans based on your health goals, dietary preferences and budget.
          </p>

          {/* 4 Feature Items */}
          <div className="mt-7 flex flex-wrap items-center gap-4 sm:gap-6 w-full max-w-xl">
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-slate-800 font-bold">BMR/TDEE</div>
                <div className="text-[11px] text-slate-500 font-normal">Calculation</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <PieChart className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-slate-800 font-bold">Macro</div>
                <div className="text-[11px] text-slate-500 font-normal">Optimization</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-slate-800 font-bold">Allergen</div>
                <div className="text-[11px] text-slate-500 font-normal">Safety</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs text-slate-800 font-bold">Smart</div>
                <div className="text-[11px] text-slate-500 font-normal">Grocery List</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition hover:shadow"
            >
              <span>Launch Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-300 shadow-xs transition"
            >
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Right Column - Hero Dish Illustration */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[480px]">
            <img
              src="/hero-dish-transparent.png"
              alt="Healthy meal bowl with grilled chicken, quinoa, broccoli, and tomatoes"
              className="w-full h-auto object-contain drop-shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mt-16 sm:mt-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Just 4 simple steps to get your perfect diet plan
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Step 1 */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Enter Your Goals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Share your health goals and preferences</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 hidden lg:block" />

          {/* Step 2 */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Get Your Plan</h3>
              <p className="text-xs text-slate-500 mt-0.5">AI calculates the best diet plan for you</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 hidden lg:block" />

          {/* Step 3 */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Check & Adjust</h3>
              <p className="text-xs text-slate-500 mt-0.5">Review and customize as needed</p>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 hidden lg:block" />

          {/* Step 4 */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3.5 shadow-xs hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Follow Easily</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get grocery list and start your diet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by LangGraph Banner */}
      <section className="mt-10 sm:mt-12">
        <div className="bg-[#ebf8f0] border border-emerald-100/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <Sprout className="w-7 h-7" />
            </div>
            <div className="hidden sm:block h-10 w-px bg-slate-300/80" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Powered by LangGraph</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                A multi-agent AI system for smarter, safer and more reliable nutrition planning.
              </p>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200/70 shadow-xs text-xs font-medium text-slate-700">
              <span className="text-slate-500">Built with</span>
              <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 inline" />
              <span className="font-semibold text-slate-800">Next.js &bull; FastAPI &bull; PostgreSQL</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
