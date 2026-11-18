"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";
import AgentVisualizer from "@/components/AgentVisualizer";
import MealCard from "@/components/MealCard";
import { MealPlan, DayMealPlan } from "@/lib/types";
import { 
  Sparkles, 
  ChefHat, 
  Play, 
  Download, 
  ShoppingCart, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  SlidersHorizontal 
} from "lucide-react";

const ALLERGEN_OPTIONS = [
  { id: "peanuts", label: "Peanuts" },
  { id: "tree_nuts", label: "Tree Nuts (Almonds, Walnuts)" },
  { id: "dairy", label: "Dairy / Lactose" },
  { id: "gluten", label: "Gluten / Wheat" },
  { id: "shellfish", label: "Shellfish" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "fish", label: "Fish" },
];

export default function PlannerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(72.0);
  const [height, setHeight] = useState(178.0);
  const [activityLevel, setActivityLevel] = useState("moderately_active");
  const [healthGoal, setHealthGoal] = useState("weight_loss");
  const [dietType, setDietType] = useState("balanced");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(7);

  // Agent Visualizer simulation stage
  const [agentStage, setAgentStage] = useState<any>("idle");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleDownloadPdf = async () => {
    if (!activePlan) return;
    try {
      setDownloading(true);
      await api.downloadMealPlanPdfBlob(activePlan.id, `Nutrition_Plan_${activePlan.id}.pdf`);
    } catch (_) {
      window.open(api.downloadMealPlanPdfUrl(activePlan.id), "_blank");
    } finally {
      setDownloading(false);
    }
  };


  // Fetch active meal plan
  const { data: activePlan, isLoading: planLoading } = useQuery<MealPlan>({
    queryKey: ["activeMealPlan"],
    queryFn: () => api.getActiveMealPlan().catch(() => null),
  });

  // Fetch profile to populate form initial values
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.getProfile().catch(() => null),
  });

  useEffect(() => {
    if (profile) {
      setAge(profile.age || 25);
      setGender(profile.gender || "male");
      setWeight(profile.weight || 72.0);
      setHeight(profile.height || 178.0);
      setActivityLevel(profile.activity_level || "moderately_active");
      setHealthGoal(profile.health_goal || "weight_loss");
      setDietType(profile.diet_type || "balanced");
      if (profile.allergies) {
        const splitted = profile.allergies.split(",").map((a: string) => a.trim().toLowerCase());
        setSelectedAllergies(splitted.filter(Boolean));
      }
    }
  }, [profile]);

  // Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      // First update profile
      await api.updateProfile({
        age,
        gender,
        weight,
        height,
        activity_level: activityLevel,
        health_goal: healthGoal,
        diet_type: dietType,
        allergies: selectedAllergies.join(", "),
      });

      // Stage visual transitions
      setAgentStage("profile");
      await new Promise((r) => setTimeout(r, 400));
      setAgentStage("macros");
      await new Promise((r) => setTimeout(r, 400));
      setAgentStage("recipes");
      await new Promise((r) => setTimeout(r, 500));
      setAgentStage("verifier");
      await new Promise((r) => setTimeout(r, 400));

      const res = await api.generateMealPlan(payload);
      return res;
    },
    onSuccess: (data) => {
      setAgentStage("completed");
      queryClient.setQueryData(["activeMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
      setSelectedDayIndex(0);
    },
    onError: () => {
      setAgentStage("idle");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({
      duration_days: durationDays,
      diet_type_override: dietType,
      strict_allergies_override: selectedAllergies,
    });
  };

  const toggleAllergy = (id: string) => {
    if (selectedAllergies.includes(id)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== id));
    } else {
      setSelectedAllergies([...selectedAllergies, id]);
    }
  };

  if (!mounted) return null;

  const currentDay: DayMealPlan | undefined = activePlan?.days?.[selectedDayIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Autonomous LangGraph State Machine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Multi-Agent Nutrition Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Profile Analyzer computes clinical BMR/TDEE &rarr; Macro Optimizer allocates exact grams &rarr; Recipe Generator synthesizes multi-day schedules &rarr; Constraint Verifier executes allergen audits with retry loops.
        </p>
      </div>

      {/* Multi-Agent DAG Visualizer Component */}
      <AgentVisualizer
        currentStage={generateMutation.isPending ? agentStage : "completed"}
        verificationScore={activePlan?.verification?.confidence_score || 100}
        retryCount={activePlan?.verification?.retry_count || 0}
      />

      {/* Main Layout: Configuration Form & Meal Plan Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Biometrics & Constraints
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                <option value="very_active">Very Active (6-7 days/week)</option>
                <option value="extra_active">Extra Active (Athlete / physical job)</option>
              </select>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Health Goal</label>
              <select
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="weight_loss">Weight Loss (-500 kcal deficit)</option>
                <option value="muscle_gain">Muscle Gain (+350 kcal surplus)</option>
                <option value="maintenance">Maintenance (Equilibrium)</option>
                <option value="athletic_performance">Athletic Performance & Glycogen</option>
              </select>
            </div>

            {/* Diet Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dietary Framework</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="balanced">Balanced / High-Protein</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="vegetarian">Vegetarian (Strictly Egg-Free & Meat-Free)</option>
                <option value="eggetarian">Eggetarian (Vegetarian with Eggs)</option>
                <option value="vegan">100% Plant-Based Vegan</option>
                <option value="keto">Ketogenic (Very Low Carb)</option>
                <option value="paleo">Paleo Clean Eating</option>
                <option value="gluten_free">Strict Gluten-Free</option>
              </select>

            </div>

            {/* Allergies Checklist */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Strict Allergen Exclusions ({selectedAllergies.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALLERGEN_OPTIONS.map((opt) => {
                  const checked = selectedAllergies.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleAllergy(opt.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium cursor-pointer transition select-none flex items-center justify-between ${
                        checked
                          ? "bg-rose-50 border-rose-300 text-rose-800"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${checked ? "border-rose-600 bg-rose-600" : "border-slate-300"}`}>
                        {checked && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duration Days */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Plan Duration (Days)
              </label>
              <div className="flex gap-2">
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
                      durationDays === days
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {days} {days === 1 ? "Day" : "Days"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing LangGraph Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Multi-Agent Pipeline</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Content: Generated Plan Explorer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activePlan ? (
            <div className="space-y-6">
              {/* Plan Action Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Verified Plan
                    </span>
                    <span className="text-xs text-slate-400">
                      Adherence: <b>{activePlan.adherence_score}%</b>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{activePlan.title}</h2>
                  <p className="text-xs text-slate-500">
                    Target: {Math.round(activePlan.target_calories)} kcal • {activePlan.target_protein}g P • {activePlan.target_carbs}g C • {activePlan.target_fats}g F
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{downloading ? "Downloading..." : "Download PDF"}</span>
                  </button>
                  <Link
                    href="/grocery"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span>Grocery Aisle Manifest</span>
                  </Link>
                </div>

              </div>

              {/* Day Selector Tabs */}
              {activePlan.days && activePlan.days.length > 0 && (
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {activePlan.days.map((day, idx) => (
                    <button
                      key={day.day_number}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border ${
                        selectedDayIndex === idx
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Day {day.day_number} ({day.day_name.slice(0, 3)})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Day Nutrition Banner */}
              {currentDay && (
                <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Day {currentDay.day_number} Daily Total
                    </span>
                    <h3 className="text-base font-bold text-white">{currentDay.day_name} Nutrition</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div>
                      <span className="text-emerald-400 text-[10px] block uppercase">Calories</span>
                      <span>{Math.round(currentDay.total_calories)} kcal</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 text-[10px] block uppercase">Protein</span>
                      <span>{currentDay.total_protein}g</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 text-[10px] block uppercase">Carbs</span>
                      <span>{currentDay.total_carbs}g</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 text-[10px] block uppercase">Fats</span>
                      <span>{currentDay.total_fats}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Cards Grid */}
              {currentDay && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDay.meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Active Meal Plan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Configure your biometrics and allergen boundaries on the left, then click <b>Execute Multi-Agent Pipeline</b> to launch LangGraph!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
