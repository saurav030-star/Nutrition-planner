"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";
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
  SlidersHorizontal,
  Info
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
  const [weight, setWeight] = useState(70.0);
  const [height, setHeight] = useState(175.0);
  const [activityLevel, setActivityLevel] = useState("moderately_active");
  const [healthGoal, setHealthGoal] = useState("weight_loss");
  const [dietType, setDietType] = useState("vegetarian");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(7);

  // Error & Validation states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generationError, setGenerationError] = useState<string | null>(null);

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
      setWeight(profile.weight || 70.0);
      setHeight(profile.height || 175.0);
      setActivityLevel(profile.activity_level || "moderately_active");
      setHealthGoal(profile.health_goal || "weight_loss");
      setDietType(profile.diet_type || "vegetarian");
      if (profile.allergies) {
        const splitted = profile.allergies.split(",").map((a: string) => a.trim().toLowerCase());
        setSelectedAllergies(splitted.filter(Boolean));
      }
    }
  }, [profile]);

  // Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      setGenerationError(null);
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

      const res = await api.generateMealPlan(payload);
      return res;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["activeMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
      setSelectedDayIndex(0);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : detail?.message || "LangGraph constraint verification could not find a compliant plan after 3 retries.";
      setGenerationError(msg);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!age || age < 14 || age > 100) {
      errors.age = "Age must be between 14 and 100.";
    }
    if (!weight || weight < 30 || weight > 250) {
      errors.weight = "Weight must be between 30 and 250 kg.";
    }
    if (!height || height < 100 || height > 250) {
      errors.height = "Height must be between 100 and 250 cm.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

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

  // Calculate actual plan average daily calories and macros across generated days
  const actualAvgCal = activePlan?.days?.length 
    ? Math.round(activePlan.days.reduce((acc, d) => acc + d.total_calories, 0) / activePlan.days.length)
    : Math.round(activePlan?.target_calories || 2000);
  const actualAvgProt = activePlan?.days?.length 
    ? (activePlan.days.reduce((acc, d) => acc + d.total_protein, 0) / activePlan.days.length).toFixed(1)
    : (activePlan?.target_protein || 150).toFixed(1);
  const actualAvgCarbs = activePlan?.days?.length 
    ? (activePlan.days.reduce((acc, d) => acc + d.total_carbs, 0) / activePlan.days.length).toFixed(1)
    : (activePlan?.target_carbs || 200).toFixed(1);
  const actualAvgFats = activePlan?.days?.length 
    ? (activePlan.days.reduce((acc, d) => acc + d.total_fats, 0) / activePlan.days.length).toFixed(1)
    : (activePlan?.target_fats || 65).toFixed(1);

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
          Profile Analyzer computes clinical BMR/TDEE &rarr; Macro Optimizer allocates exact grams &rarr; Recipe Generator synthesizes complete 7-day schedules &rarr; Constraint Verifier executes allergen & dietary protocol audits with self-correction retry loops.
        </p>
      </div>

      {/* Error Alert Banner if 422 LangGraph Constraint Verification Rejection */}
      {generationError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-950">Multi-Agent Constraint Verification Alert</h4>
            <p className="text-rose-700 leading-relaxed">{generationError}</p>
          </div>
        </div>
      )}

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
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.age ? "border-rose-400 bg-rose-50/50" : "border-slate-200"}`}
                />
                {formErrors.age && <p className="text-[10px] text-rose-600 mt-1">{formErrors.age}</p>}
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
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.weight ? "border-rose-400 bg-rose-50/50" : "border-slate-200"}`}
                />
                {formErrors.weight && <p className="text-[10px] text-rose-600 mt-1">{formErrors.weight}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.height ? "border-rose-400 bg-rose-50/50" : "border-slate-200"}`}
                />
                {formErrors.height && <p className="text-[10px] text-rose-600 mt-1">{formErrors.height}</p>}
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
                <option value="extra_active">Extra Active (Athlete / heavy training)</option>
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

            {/* Dietary Framework */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dietary Framework</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30 font-medium text-slate-900"
              >
                <option value="vegetarian">Vegetarian (Strictly Egg-Free & Meat-Free)</option>
                <option value="vegan">100% Plant-Based Vegan</option>
                <option value="balanced">Balanced Whole Foods</option>
                <option value="high_protein">High-Protein Hypertrophy (35% Protein)</option>
                <option value="low_carb">Low-Carb / Ketogenic</option>
                <option value="gluten_free">Strict Gluten-Free</option>
              </select>
            </div>

            {/* Strict Allergen Exclusions */}
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

            {/* Plan Duration */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Plan Duration
              </label>
              <div className="flex gap-2">
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
                      durationDays === days
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
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
                  <span>Executing Multi-Agent LangGraph...</span>
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
              {/* Plan Action Bar with Target vs Actual Separation */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Verified Plan
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Calculated Adherence: <b className="text-emerald-700">{activePlan.adherence_score}%</b>
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{activePlan.title}</h2>
                  
                  {/* Separate Target vs Actual Nutritional Breakdown */}
                  <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                    <div>
                      <span className="font-semibold text-slate-700">Target Calories & Macros:</span> {Math.round(activePlan.target_calories)} kcal • {activePlan.target_protein}g P • {activePlan.target_carbs}g C • {activePlan.target_fats}g F
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-700">Actual Calculated Daily Avg:</span> {actualAvgCal} kcal • {actualAvgProt}g P • {actualAvgCarbs}g C • {actualAvgFats}g F
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
                    <span>Grocery Manifest</span>
                  </Link>
                </div>
              </div>

              {/* Complete Seven-Day Navigation Bar (Grid cols 7 on md/lg desktop: Monday to Sunday) */}
              {activePlan.days && activePlan.days.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>Select Day ({activePlan.days.length} Days Generated)</span>
                    <span className="text-emerald-600">Active: Day {selectedDayIndex + 1} ({activePlan.days[selectedDayIndex]?.day_name})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pb-1">
                    {activePlan.days.map((day, idx) => (
                      <button
                        key={day.day_number}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border text-center ${
                          selectedDayIndex === idx
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {day.day_name.slice(0, 3)} (D{day.day_number})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Nutrition Banner with Independent Daily Totals */}
              {currentDay && (
                <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Day {currentDay.day_number} Daily Total
                    </span>
                    <h3 className="text-base font-bold text-white">{currentDay.day_name} Nutrition</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-800">
                      <span className="text-emerald-400 text-[10px] block uppercase font-bold">Calories</span>
                      <span>{Math.round(currentDay.total_calories)} kcal</span>
                    </div>
                    <div className="bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-800">
                      <span className="text-emerald-400 text-[10px] block uppercase font-bold">Protein</span>
                      <span>{currentDay.total_protein}g</span>
                    </div>
                    <div className="bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-800">
                      <span className="text-emerald-400 text-[10px] block uppercase font-bold">Carbs</span>
                      <span>{currentDay.total_carbs}g</span>
                    </div>
                    <div className="bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-800">
                      <span className="text-emerald-400 text-[10px] block uppercase font-bold">Fats</span>
                      <span>{currentDay.total_fats}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Cards Grid (Breakfast, Lunch, Dinner, Snack) */}
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
