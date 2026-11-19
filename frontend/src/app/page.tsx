"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  PieChart, 
  ShoppingCart, 
  Calculator,
  User,
  BarChart2,
  Sprout,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 sm:pt-4">
        {/* Left Column: Text & Features */}
        <div className="lg:col-span-7 space-y-5">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Your AI Nutrition Assistant</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Enterprise-Grade<br />
            AI Nutrition Planner
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            Get personalized diet plans based on your health goals, dietary preferences and budget.
          </p>

          {/* 4 Feature Highlights */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 pt-2">
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">BMR/TDEE</p>
                <p className="text-[11px] text-slate-500 leading-tight">Calculation</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Macro</p>
                <p className="text-[11px] text-slate-500 leading-tight">Optimization</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Allergen</p>
                <p className="text-[11px] text-slate-500 leading-tight">Safety</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">Smart</p>
                <p className="text-[11px] text-slate-500 leading-tight">Grocery List</p>
              </div>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
            >
              <span>Launch Planner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold border border-slate-200 shadow-sm transition"
            >
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Bowl Graphic */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
            <Image
              src="/hero-bowl.png"
              alt="AI Nutrition Planner Healthy Meal Bowl"
              width={454}
              height={336}
              priority
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-6 pt-2">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Just 4 simple steps to get your perfect diet plan
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Step 1 */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">1. Enter Your Goals</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Share your health goals and preferences
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">2. Get Your Plan</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                AI calculates the best diet plan for you
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 3 */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">3. Check & Adjust</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Review and customize as needed
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 4 */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3.5 flex-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">4. Follow Easily</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Get grocery list and start your diet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by LangGraph Bottom Banner */}
      <section className="pb-4">
        <div className="bg-[#eefcf4] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Powered by LangGraph</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                A multi-agent AI system for smarter, safer and more reliable nutrition planning.
              </p>
            </div>
          </div>

          <div className="self-end md:self-auto">
            <div className="bg-white px-3.5 py-1.5 rounded-full border border-emerald-100 shadow-xs flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span>Built with</span>
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span className="font-semibold text-slate-900">Next.js · FastAPI · PostgreSQL</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}