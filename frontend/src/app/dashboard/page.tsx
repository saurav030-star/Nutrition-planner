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
  Circle,
  RotateCw, 
  ShoppingCart, 
  ArrowUpRight, 
  Calendar,
  Sun,
  Utensils,
  CookingPot,
  Apple,
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
  ReferenceLine,
  LabelList
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
  const { data: activePlan } = useQuery({
    queryKey: ["activeMealPlan"],
    queryFn: () => api.getActiveMealPlan().catch(() => null),
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getProfile().catch(() => null),
  });

  // Fetch 30-day nutrition logs to support range filtering
  const { data: logs = [] } = useQuery({
    queryKey: ["nutritionLogs"],
    queryFn: () => api.getNutritionLogs(30),
  });

  // Locked target values derived from active meal plan or profile
  const targetCal = activePlan?.target_calories || profile?.target_calories || 2451;
  const targetProt = activePlan?.target_protein || profile?.target_protein_g || 184;
  const targetCarbs = activePlan?.target_carbs || profile?.target_carbs_g || 245;
  const targetFats = activePlan?.target_fats || profile?.target_fats_g || 82;
  const planDays = activePlan?.duration_days || 3;

  // Identify today's log (or most recent log entry)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find((l: any) => l.log_date === todayStr) || logs[logs.length - 1] || null;

  // Consumed values derived from today's log items (starts strictly at 0 if no meals completed!)
  const consumedCal = todayLog ? Math.round(todayLog.consumed_calories) : 0;
  const consumedProt = todayLog ? Math.round(todayLog.consumed_protein) : 0;
  const consumedCarbs = todayLog ? Math.round(todayLog.consumed_carbs) : 0;
  const consumedFats = todayLog ? Math.round(todayLog.consumed_fats) : 0;

  const caloriePct = targetCal > 0 ? Math.min(100, Math.round((consumedCal / targetCal) * 100)) : 0;
  const protPct = targetProt > 0 ? Math.min(100, Math.round((consumedProt / targetProt) * 100)) : 0;
  const carbsPct = targetCarbs > 0 ? Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)) : 0;
  const fatsPct = targetFats > 0 ? Math.min(100, Math.round((consumedFats / targetFats) * 100)) : 0;

  // Meal consumption toggle mutation
  const logMutation = useMutation({
    mutationFn: (updatedLog: any) => api.logDailyIntake(updatedLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
    },
  });

  const handleToggleMeal = (itemIndex: number) => {
    if (!todayLog || !todayLog.items) return;
    const items = todayLog.items.map((item: any, idx: number) => {
      if (idx === itemIndex) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    // Recalculate consumed exclusively from completed items
    const newCal = items.filter((i: any) => i.completed).reduce((acc: number, i: any) => acc + (i.calories || 0), 0);
    const newProt = items.filter((i: any) => i.completed).reduce((acc: number, i: any) => acc + (i.protein || 0), 0);
    const newCarbs = items.filter((i: any) => i.completed).reduce((acc: number, i: any) => acc + (i.carbs || 0), 0);
    const newFats = items.filter((i: any) => i.completed).reduce((acc: number, i: any) => acc + (i.fats || 0), 0);

    // Optimistically update React Query cache for zero latency
    queryClient.setQueryData(["nutritionLogs"], (oldLogs: any[] = []) => {
      return oldLogs.map((l: any) => {
        if (l.log_date === todayLog.log_date) {
          return {
            ...l,
            consumed_calories: Math.round(newCal),
            consumed_protein: Math.round(newProt),
            consumed_carbs: Math.round(newCarbs),
            consumed_fats: Math.round(newFats),
            items,
          };
        }
        return l;
      });
    });

    logMutation.mutate({
      log_date: todayLog.log_date,
      consumed_calories: Math.round(newCal),
      consumed_protein: Math.round(newProt),
      consumed_carbs: Math.round(newCarbs),
      consumed_fats: Math.round(newFats),
      items,
      notes: "Updated from interactive dashboard",
    });
  };

  // Build chart dataset from today forward for the plan duration (matching user's design)
  const logsMap = new Map<string, any>();
  logs.forEach((l: any) => logsMap.set(l.log_date, l));
  if (todayLog) logsMap.set(todayLog.log_date, todayLog);

  const chartData: any[] = [];
  const baseDate = new Date(); // Start at today
  for (let i = 0; i < planDays; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entry = logsMap.get(dStr);
    chartData.push({
      date: dStr,
      label,
      calories: entry ? Math.round(entry.consumed_calories) : 0,
      target: Math.round(targetCal),
    });
  }

  const getMealIcon = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes("breakfast")) return <Sun className="w-4 h-4 text-emerald-600" />;
    if (type.includes("lunch")) return <Utensils className="w-4 h-4 text-emerald-600" />;
    if (type.includes("dinner")) return <CookingPot className="w-4 h-4 text-emerald-600" />;
    return <Apple className="w-4 h-4 text-emerald-600" />;
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Nutritional Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your daily nutrition and progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/planner"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RotateCw className="w-4 h-4" />
            <span>Generate New Plan</span>
          </Link>
          <Link
            href="/grocery"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>View Grocery List</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards: Calories, Protein, Carbohydrates, Fats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Calories Today</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedCal}{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetCal)} kcal</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {caloriePct}% of daily goal
          </span>
        </div>

        {/* Protein Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Protein</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedProt}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetProt)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${protPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {protPct}% of daily goal
          </span>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Carbohydrates</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wheat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedCarbs}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetCarbs)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {carbsPct}% of daily goal
          </span>
        </div>

        {/* Fats Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-500">Fats</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Droplet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {consumedFats}g{" "}
              <span className="text-xs font-normal text-slate-400">/ {Math.round(targetFats)}g</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${fatsPct}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {fatsPct}% of daily goal
          </span>
        </div>
      </div>

      {/* Main Grid: Macro Breakdown Donut & Intake vs Target Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Daily Macronutrient Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Daily Macronutrient Distribution</h3>
          </div>

          <MacroChart
            proteinGrams={targetProt}
            carbsGrams={targetCarbs}
            fatsGrams={targetFats}
            calories={targetCal}
          />
        </div>

        {/* Card 2: Calorie Intake & Target Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          {/* Header & Plan Badge (Matching Screenshot) */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Calorie Intake & Target</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking synchronized with your active {planDays}-day plan
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-600 font-medium mt-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm inline-block" />
                  Actual intake
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 border-t-2 border-dashed border-slate-400 inline-block" />
                  Daily target
                </span>
              </div>
            </div>

            <div className="text-right space-y-1 shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{planDays}-Day Target Plan</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {planDays} daily targets scheduled
              </div>
              <div>
                <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  Daily target • {Math.round(targetCal).toLocaleString()} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 24, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: "#64748B" }} 
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, (dataMax: number) => Math.max(2500, Math.ceil((targetCal + 200) / 500) * 500)]}
                  ticks={[0, 500, 1000, 1500, 2000, 2500]}
                  tick={{ fontSize: 11, fill: "#64748B" }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kcal`, "Actual Intake"]}
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <ReferenceLine 
                  y={targetCal} 
                  stroke="#CBD5E1" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5} 
                />
                <Bar 
                  dataKey="calories" 
                  name="Actual Intake" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={48}
                >
                  <LabelList
                    dataKey="calories"
                    content={(props: any) => {
                      const { x, y, width, value } = props;
                      if (value && Number(value) > 0) {
                        return (
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 8}
                            fill="#0F172A"
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={700}
                          >
                            {Number(value).toLocaleString()} kcal
                          </text>
                        );
                      }
                      return (
                        <text
                          x={Number(x) + Number(width) / 2}
                          y={Number(y) - 12}
                          fill="#94A3B8"
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={500}
                        >
                          ⓘ No data yet
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Today's Meals Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Today's Meals</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Active Plan: {activePlan ? activePlan.title : "3-Day AI Optimized Meal Plan (Balanced)"}
          </span>
        </div>

        {todayLog && todayLog.items && todayLog.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {todayLog.items.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleToggleMeal(idx)}
                className={`p-4 rounded-2xl border cursor-pointer transition select-none flex items-center justify-between gap-3 shadow-xs ${
                  item.completed
                    ? "bg-emerald-50/40 border-emerald-300"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    {getMealIcon(item.meal_type || item.name)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400 truncate max-w-[130px] sm:max-w-[150px]">
                      {item.summary || `${Math.round(item.calories)} kcal meal`}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {item.completed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                      <Circle className="w-3.5 h-3.5 text-slate-300" />
                      Pending
                    </span>
                  )}
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