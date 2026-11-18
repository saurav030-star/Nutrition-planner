"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import MacroChart from "@/components/MacroChart";
import { 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplet, 
  CheckCircle2, 
  Circle,
  Utensils, 
  Sun, 
  ConciergeBell, 
  Apple, 
  RefreshCw, 
  ShoppingCart, 
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  ReferenceLine 
} from "recharts";

const DEFAULT_MEALS = [
  {
    meal_type: "breakfast",
    name: "Breakfast",
    summary: "Oats with milk & fruits",
    calories: 620,
    protein: 48,
    carbs: 65,
    fats: 18,
    completed: true,
  },
  {
    meal_type: "lunch",
    name: "Lunch",
    summary: "Rice, dal & vegetables",
    calories: 550,
    protein: 38,
    carbs: 60,
    fats: 18,
    completed: false,
  },
  {
    meal_type: "dinner",
    name: "Dinner",
    summary: "Chapati, paneer sabzi",
    calories: 393,
    protein: 28,
    carbs: 38,
    fats: 16,
    completed: false,
  },
  {
    meal_type: "snack",
    name: "Snacks",
    summary: "Nuts & fresh fruit",
    calories: 888,
    protein: 70,
    carbs: 82,
    fats: 30,
    completed: true,
  },
];

const getMealIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("breakfast")) return Sun;
  if (t.includes("lunch")) return Utensils;
  if (t.includes("dinner")) return ConciergeBell;
  return Apple;
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {}
      window.scrollTo(0, 0);
    }
  }, []);

  // Fetch active meal plan
  const { data: activePlan } = useQuery({
    queryKey: ["activeMealPlan"],
    queryFn: () => api.getActiveMealPlan().catch(() => null),
  });

  const planDuration = activePlan?.duration_days || 7;
  const totalChartWeeks = Math.ceil(planDuration / 7);
  const [activeChartWeek, setActiveChartWeek] = useState(1);

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getProfile().catch(() => null),
  });

  // Fetch nutrition logs from backend for the plan duration
  const { data: rawLogs } = useQuery({
    queryKey: ["nutritionLogs", planDuration],
    queryFn: () => api.getNutritionLogs(Math.max(7, planDuration)).catch(() => []),
  });

  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Toggle meal checklist mutation
  const logMutation = useMutation({
    mutationFn: (updatedLog: any) => api.logDailyIntake(updatedLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
    },
  });

  // Target values from active plan or profile
  const targetCal = activePlan?.target_calories || profile?.target_calories || 2451;
  const targetProt = activePlan?.target_protein || profile?.target_protein_g || 184;
  const targetCarbs = activePlan?.target_carbs || profile?.target_carbs_g || 245;
  const targetFats = activePlan?.target_fats || profile?.target_fats_g || 82;

  // Meal items for today
  const mealsForToday = (latestLog?.items && latestLog.items.length > 0)
    ? latestLog.items
    : DEFAULT_MEALS;

  // Actual consumed calculations based on latest log or completed meals
  const consumedCal = latestLog 
    ? Math.round(latestLog.consumed_calories) 
    : mealsForToday.filter(m => m.completed).reduce((acc, m) => acc + m.calories, 0);

  const consumedProt = latestLog 
    ? Math.round(latestLog.consumed_protein) 
    : mealsForToday.filter(m => m.completed).reduce((acc, m) => acc + m.protein, 0);

  const consumedCarbs = latestLog 
    ? Math.round(latestLog.consumed_carbs) 
    : mealsForToday.filter(m => m.completed).reduce((acc, m) => acc + m.carbs, 0);

  const consumedFats = latestLog 
    ? Math.round(latestLog.consumed_fats) 
    : mealsForToday.filter(m => m.completed).reduce((acc, m) => acc + m.fats, 0);

  const caloriePct = Math.min(100, Math.round((consumedCal / targetCal) * 100));
  const protPct = Math.min(100, Math.round((consumedProt / targetProt) * 100));
  const carbsPct = Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100));
  const fatsPct = Math.min(100, Math.round((consumedFats / targetFats) * 100));

  const handleToggleMeal = (itemIndex: number) => {
    const items = mealsForToday.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    const newCal = items.filter((i) => i.completed).reduce((acc, i) => acc + i.calories, 0);
    const newProt = items.filter((i) => i.completed).reduce((acc, i) => acc + i.protein, 0);
    const newCarbs = items.filter((i) => i.completed).reduce((acc, i) => acc + i.carbs, 0);
    const newFats = items.filter((i) => i.completed).reduce((acc, i) => acc + i.fats, 0);

    const logDate = latestLog?.log_date || new Date().toISOString().slice(0, 10);

    logMutation.mutate({
      log_date: logDate,
      consumed_calories: Math.round(newCal),
      consumed_protein: Math.round(newProt),
      consumed_carbs: Math.round(newCarbs),
      consumed_fats: Math.round(newFats),
      items,
      notes: "Updated from interactive dashboard",
    });
  };

  // Build timeline automatically matching the active plan duration
  const chartData = (() => {
    const baseDate = latestLog?.log_date ? new Date(latestLog.log_date + "T12:00:00") : new Date();
    const result = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Automatically display the exact number of days of the active plan
    // If planDuration is 1, count is 1. If 3, count is 3. If 7, count is 7.
    // If planDuration > 7 (e.g. 14, 30 days), slice 7 days for the active chart week
    const weekOffset = (activeChartWeek - 1) * 7;
    const daysRemaining = Math.max(1, planDuration - weekOffset);
    const dayCount = totalChartWeeks > 1 ? Math.min(7, daysRemaining) : planDuration;

    for (let i = 0; i < dayCount; i++) {
      const d = new Date(baseDate);
      const dayDelta = i + weekOffset;
      d.setDate(baseDate.getDate() + dayDelta);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const iso = `${year}-${month}-${day}`;
      const label = `${months[d.getMonth()]} ${d.getDate()}`;

      // Check if actual log exists for this date
      const found = logs.find((l: any) => l.log_date === iso);
      const hasCal = found && typeof found.consumed_calories === "number" && found.consumed_calories > 0;
      const isToday = dayDelta === 0;
      const calValue = hasCal 
        ? Math.round(found.consumed_calories) 
        : (isToday && consumedCal > 0 ? consumedCal : null);

      result.push({
        date: label,
        isoDate: iso,
        calories: calValue,
        hasData: calValue !== null && calValue > 0,
        target: Math.round(targetCal),
      });
    }

    return result;
  })();

  // Custom tick for X-Axis to render Info Icon (i) and "No data yet" above empty days
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find((d) => d.date === payload.value);
    const showNoData = item && !item.hasData;

    return (
      <g transform={`translate(${x},${y})`}>
        {showNoData && (
          <g transform="translate(0, -32)">
            {/* Info circle icon (i) */}
            <circle cx="0" cy="0" r="7.5" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
              i
            </text>
            {/* "No data yet" text */}
            <text x="0" y="15" textAnchor="middle" fill="#64748B" fontSize="10.5" fontWeight="500">
              No data yet
            </text>
          </g>
        )}
        {/* Tick line */}
        <line x1="0" y1="0" x2="0" y2="5" stroke="#CBD5E1" strokeWidth="1" />
        {/* Date Label */}
        <text x="0" y="20" textAnchor="middle" fill="#1E293B" fontSize="11.5" fontWeight="600">
          {payload.value}
        </text>
      </g>
    );
  };

  // Custom label to render calorie number on top of bar (e.g. "1,508 kcal")
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#0F172A"
        textAnchor="middle"
        fontSize={12}
        fontWeight="700"
      >
        {Math.round(value).toLocaleString()} kcal
      </text>
    );
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-12 space-y-5 sm:space-y-6">
      {/* ROW 1: Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nutritional Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your daily nutrition and progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/planner"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate New Plan</span>
          </Link>
          <Link
            href="/grocery"
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200/80 shadow-xs transition"
          >
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span>View Grocery Manifest</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ROW 2: Four Nutrition Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Calories Today</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">{consumedCal}</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">/ {Math.round(targetCal)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-2.5">
            {caloriePct}% of daily goal
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Protein</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">{consumedProt}g</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">/ {Math.round(targetProt)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${protPct}%` }}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-2.5">
            {protPct}% of daily goal
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Carbohydrates</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">{consumedCarbs}g</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">/ {Math.round(targetCarbs)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-2.5">
            {carbsPct}% of daily goal
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fats</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline">
              <span className="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight">{consumedFats}g</span>
              <span className="text-xs font-medium text-slate-400 ml-1.5">/ {Math.round(targetFats)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${fatsPct}%` }}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-600 mt-2.5">
            {fatsPct}% of daily goal
          </div>
        </div>
      </div>

      {/* ROW 3: Left: Daily Macronutrient Distribution | Right: Calorie Intake & Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Daily Macronutrient Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-[360px]">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Daily Macronutrient Distribution
          </h3>

          <div className="flex-1 flex items-center justify-center">
            <MacroChart
              proteinGrams={targetProt}
              carbsGrams={targetCarbs}
              fatsGrams={targetFats}
              calories={targetCal}
            />
          </div>
        </div>

        {/* Right: Calorie Intake & Target (Dynamic by Plan Duration) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-[360px] relative">
          {/* Floating Daily Target Pill on the right */}
          <div className="absolute right-6 top-[78px] z-10 pointer-events-none">
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100/90 border border-slate-200/90 px-2.5 py-0.5 rounded-full shadow-2xs">
              Daily target · {Math.round(targetCal).toLocaleString()} kcal
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Calorie Intake & Target
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time tracking synchronized with your active {planDuration}-day plan
              </p>

              {/* Legend */}
              <div className="flex items-center gap-5 text-xs font-medium text-slate-600 mt-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
                  <span className="font-semibold text-slate-700">Actual intake</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 border-t-2 border-dashed border-slate-400" />
                  <span className="text-slate-500">Daily target</span>
                </div>
              </div>
            </div>

            {/* Catchy Active Plan Badge */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-3.5 py-1.5 rounded-xl shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-extrabold tracking-tight">
                  {planDuration}-Day Target Plan
                </span>
              </div>
              {totalChartWeeks > 1 ? (
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  <button
                    type="button"
                    disabled={activeChartWeek <= 1}
                    onClick={() => setActiveChartWeek((w) => Math.max(1, w - 1))}
                    className="hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none p-0.5 cursor-pointer"
                    title="Previous Week"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span>Week {activeChartWeek} of {totalChartWeeks}</span>
                  <button
                    type="button"
                    disabled={activeChartWeek >= totalChartWeeks}
                    onClick={() => setActiveChartWeek((w) => Math.min(totalChartWeeks, w + 1))}
                    className="hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none p-0.5 cursor-pointer"
                    title="Next Week"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  {planDuration === 1 ? "1 single-day schedule" : `${planDuration} daily targets scheduled`}
                </span>
              )}
            </div>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 25, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  tick={<CustomXAxisTick />} 
                  tickLine={false} 
                  axisLine={{ stroke: "#CBD5E1" }} 
                  interval={0}
                />
                <YAxis 
                  domain={[0, 2600]} 
                  ticks={[0, 500, 1000, 1500, 2000, 2500]} 
                  tickLine={false} 
                  axisLine={{ stroke: "#CBD5E1" }} 
                  tick={{ fontSize: 11, fill: "#64748B" }} 
                  tickFormatter={(val) => val === 0 ? "0" : val.toLocaleString()}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.04)" }}
                  contentStyle={{ 
                    backgroundColor: "#0F172A", 
                    borderRadius: "8px", 
                    border: "none", 
                    color: "#fff", 
                    fontSize: "12px" 
                  }}
                  formatter={(val: any) => val ? [`${Number(val).toLocaleString()} kcal`, "Actual Intake"] : ["No data yet", "Actual Intake"]}
                />
                <ReferenceLine 
                  y={Math.round(targetCal)} 
                  stroke="#94A3B8" 
                  strokeDasharray="4 4" 
                />
                <Bar 
                  dataKey="calories" 
                  name="Actual Intake" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={56} 
                  label={renderCustomBarLabel}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 4: Today's Meals (Full-width section) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-none">Today's Meals</h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 inline-block mt-1">
              Active Plan: {activePlan ? activePlan.title : "7-Day AI Optimized Meal Plan (Balanced)"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {mealsForToday.map((item: any, idx: number) => {
            const IconComponent = getMealIcon(item.meal_type || item.name);
            const isCompleted = !!item.completed;

            return (
              <div
                key={idx}
                onClick={() => handleToggleMeal(idx)}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition cursor-pointer select-none flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.name || item.meal_type}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.summary || (item.calories ? `${Math.round(item.calories)} kcal` : "")}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {isCompleted ? (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                    <Circle className="w-3.5 h-3.5 text-slate-300" />
                    <span>Pending</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
