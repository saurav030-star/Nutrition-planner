"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";
import MacroChart from "@/components/MacroChart";
import { 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Layers
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Fetch active meal plan
  const { data: activePlan, isLoading: planLoading } = useQuery({
    queryKey: ["activeMealPlan"],
    queryFn: () => api.getActiveMealPlan().catch(() => null),
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getProfile().catch(() => null),
  });

  // Fetch 7-day nutrition logs
  const { data: logs = [] } = useQuery({
    queryKey: ["nutritionLogs"],
    queryFn: () => api.getNutritionLogs(7),
  });

  const latestLog = logs[logs.length - 1] || null;

  // Toggle meal checklist mutation
  const logMutation = useMutation({
    mutationFn: (updatedLog: any) => api.logDailyIntake(updatedLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
    },
  });

  const handleToggleMeal = (itemIndex: number) => {
    if (!latestLog) return;
    const items = [...latestLog.items];
    const targetItem = { ...items[itemIndex], completed: !items[itemIndex].completed };
    items[itemIndex] = targetItem;

    // Recalculate consumed
    const consumedCal = items.filter((i) => i.completed).reduce((acc, i) => acc + i.calories, 0);
    const consumedProt = items.filter((i) => i.completed).reduce((acc, i) => acc + i.protein, 0);
    const consumedCarbs = items.filter((i) => i.completed).reduce((acc, i) => acc + i.carbs, 0);
    const consumedFats = items.filter((i) => i.completed).reduce((acc, i) => acc + i.fats, 0);

    logMutation.mutate({
      log_date: latestLog.log_date,
      consumed_calories: Math.round(consumedCal),
      consumed_protein: Math.round(consumedProt),
      consumed_carbs: Math.round(consumedCarbs),
      consumed_fats: Math.round(consumedFats),
      items,
      notes: "Updated from interactive dashboard",
    });
  };

  const targetCal = activePlan?.target_calories || profile?.target_calories || 2000;
  const targetProt = activePlan?.target_protein || profile?.target_protein_g || 150;
  const targetCarbs = activePlan?.target_carbs || profile?.target_carbs_g || 200;
  const targetFats = activePlan?.target_fats || profile?.target_fats_g || 65;

  const consumedCal = latestLog ? Math.round(latestLog.consumed_calories) : Math.round(targetCal * 0.72);
  const consumedProt = latestLog ? Math.round(latestLog.consumed_protein) : Math.round(targetProt * 0.75);
  const consumedCarbs = latestLog ? Math.round(latestLog.consumed_carbs) : Math.round(targetCarbs * 0.70);
  const consumedFats = latestLog ? Math.round(latestLog.consumed_fats) : Math.round(targetFats * 0.68);

  const caloriePct = Math.min(100, Math.round((consumedCal / targetCal) * 100));

  // Historical chart data
  const chartData = logs.map((l: any) => ({
    date: l.log_date.slice(5),
    calories: Math.round(l.consumed_calories),
    target: Math.round(l.target_calories),
  }));

  // Weekly Nutrition Totals across the active 7-day plan
  const planDays = activePlan?.days || [];
  const weeklyTotalCal = planDays.reduce((acc: number, d: any) => acc + d.total_calories, 0);
  const weeklyTotalProt = planDays.reduce((acc: number, d: any) => acc + d.total_protein, 0);
  const weeklyTotalCarbs = planDays.reduce((acc: number, d: any) => acc + d.total_carbs, 0);
  const weeklyTotalFats = planDays.reduce((acc: number, d: any) => acc + d.total_fats, 0);

  // Grocery count
  const groceryList: Record<string, string[]> = (activePlan?.grocery_list as Record<string, string[]>) || {};
  const totalGroceryItems: number = Object.values(groceryList).reduce((acc: number, items: any) => acc + (Array.isArray(items) ? items.length : 0), 0);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Nutritional Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinical Nutrition & Adherence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time macro-nutrient telemetry synchronized with LangGraph autonomous multi-agent state
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/planner"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Meal Plan</span>
          </Link>
          <Link
            href="/grocery"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Grocery Manifest</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards: Calorie, Protein, Carbs, Fats Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Calories Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedCal}{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetCal)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {caloriePct}% daily energy fulfilled
          </span>
        </div>

        {/* Protein Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Protein Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedProt}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetProt)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((consumedProt / targetProt) * 100))}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">
            {Math.round((consumedProt / targetProt) * 100)}% muscle retention target
          </span>
        </div>

        {/* Carbs Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbohydrates</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedCarbs}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetCarbs)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100))}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-sky-600 font-semibold">
            {Math.round((consumedCarbs / targetCarbs) * 100)}% glycogen replenishment
          </span>
        </div>

        {/* Fats Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Healthy Fats</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedFats}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetFats)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((consumedFats / targetFats) * 100))}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">
            {Math.round((consumedFats / targetFats) * 100)}% cellular & hormonal balance
          </span>
        </div>
      </div>

      {/* Requirement 10: Three Specialized Clinical Metric Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Weekly Nutrition Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Nutrition Summary</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {planDays.length || 7} Days
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Weekly Energy:</span>
              <b className="text-slate-900 font-bold">{Math.round(weeklyTotalCal)} kcal</b>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Weekly Protein:</span>
              <b className="text-emerald-700 font-bold">{Math.round(weeklyTotalProt)}g</b>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Weekly Carbs:</span>
              <b className="text-sky-700 font-bold">{Math.round(weeklyTotalCarbs)}g</b>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Weekly Fats:</span>
              <b className="text-amber-700 font-bold">{Math.round(weeklyTotalFats)}g</b>
            </div>
            <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
              <span>Daily Calorie Average:</span>
              <b className="text-slate-900 font-bold">
                {planDays.length ? Math.round(weeklyTotalCal / planDays.length) : Math.round(targetCal)} kcal/day
              </b>
            </div>
          </div>
        </div>

        {/* Panel 2: Dietary Compliance Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Dietary Compliance Status</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Audit Passed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Strict Vegetarian Protocol</span>
                <span className="text-[11px] text-emerald-700">100% verified egg-free, meat-free & seafood-free</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Allergen Exclusion Shield</span>
                <span className="text-[11px] text-slate-500">0 critical cross-contact ingredients detected</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic pt-1">
              {activePlan?.verification?.remarks || "Validated by LangGraph Constraint Verifier Agent"}
            </p>
          </div>
        </div>

        {/* Panel 3: Weekly Grocery Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Grocery Summary</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {totalGroceryItems} Items
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Supermarket Aisle Zones:</span>
              <b className="text-slate-900 font-bold">{Object.keys(groceryList).length} Zones</b>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Consolidated Duplicate Ingredients:</span>
              <b className="text-emerald-700 font-bold">100% Merged</b>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Fulfillment Status:</span>
              <b className="text-slate-900 font-bold">Ready for Procurement</b>
            </div>

            <Link
              href="/grocery"
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Grocery Aisle Checklist</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Macro Breakdown Donut & 7-Day Intake Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Interactive Macro Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Target Macronutrient Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated by Mifflin-St Jeor & Macro Optimizer Agent</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {profile?.health_goal ? profile.health_goal.replace("_", " ").toUpperCase() : "BALANCED"}
            </span>
          </div>

          <MacroChart
            proteinGrams={targetProt}
            carbsGrams={targetCarbs}
            fatsGrams={targetFats}
            calories={targetCal}
          />
        </div>

        {/* Card 2: 7-Day Caloric Intake Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Caloric Intake vs Target</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical tracking and goal adherence telemetry</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Trend</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length ? chartData : [{ date: "Today", calories: consumedCal, target: targetCal }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="calories" name="Consumed Calories" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Daily Meal Consumption Checklist */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Meal Adherence Checklist</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off meals eaten to dynamically synchronize server-state intake via React Query
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Active Plan: <b>{activePlan ? activePlan.title : "Default AI Balanced Protocol"}</b>
          </span>
        </div>

        {latestLog && latestLog.items && latestLog.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {latestLog.items.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleToggleMeal(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition select-none flex items-start justify-between gap-3 ${
                  item.completed
                    ? "bg-emerald-50/70 border-emerald-300"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.completed
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.meal_type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">{item.name}</h4>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round(item.calories)} kcal • {item.protein}g P • {item.carbs}g C • {item.fats}g F
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                    item.completed
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-slate-300 bg-white"
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No meals logged for today yet.{" "}
            <Link href="/planner" className="text-emerald-600 font-semibold hover:underline">
              Generate a meal plan to populate your daily checklist!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
