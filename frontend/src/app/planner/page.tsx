"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import MealCard from "@/components/MealCard";
import { MealPlan, DayMealPlan } from "@/lib/types";
import { 
  Play, 
  ShoppingCart, 
  Calendar, 
  CheckCircle2, 
  SlidersHorizontal,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChefHat
} from "lucide-react";

const ALLERGEN_OPTIONS = [
  { id: "peanuts", label: "Peanuts" },
  { id: "tree_nuts", label: "Tree Nuts" },
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
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState(60.0);
  const [height, setHeight] = useState(173.0);
  const [activityLevel, setActivityLevel] = useState("moderately_active");
  const [healthGoal, setHealthGoal] = useState("maintenance");
  const [dietType, setDietType] = useState("balanced");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [durationDays, setDurationDays] = useState(7);
  const [durationInput, setDurationInput] = useState("7");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeWeekTab, setActiveWeekTab] = useState(1);

  // Sync active week tab whenever selectedDayIndex changes
  useEffect(() => {
    const computedWeek = Math.floor(selectedDayIndex / 7) + 1;
    setActiveWeekTab(computedWeek);
  }, [selectedDayIndex]);

  const handleDurationChange = (val: number) => {
    const clamped = Math.max(1, Math.min(90, Math.round(val)));
    setDurationDays(clamped);
    setDurationInput(String(clamped));
  };

  const handleInputChange = (valStr: string) => {
    setDurationInput(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 90) {
      setDurationDays(parsed);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(durationInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      handleDurationChange(1);
    } else if (parsed > 90) {
      handleDurationChange(90);
    } else {
      handleDurationChange(parsed);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setAge(profile.age || 21);
      setGender(profile.gender || "male");
      setWeight(profile.weight || 60.0);
      setHeight(profile.height || 173.0);
      setActivityLevel(profile.activity_level || "moderately_active");
      setHealthGoal(profile.health_goal || "maintenance");
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

      const res = await api.generateMealPlan(payload);
      return res;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["activeMealPlan"], data);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["nutritionLogs"] });
      setSelectedDayIndex(0);
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const validDuration = Math.max(1, Math.min(90, Math.round(durationDays || 7)));
    generateMutation.mutate({
      duration_days: validDuration,
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

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-slate-100 rounded-3xl" />
          <div className="lg:col-span-7 h-96 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  const currentDay: DayMealPlan | undefined = activePlan?.days?.[selectedDayIndex];
  const displayTitle = activePlan?.title 
    ? activePlan.title.replace("Optimized", "Personalized") 
    : `${activePlan?.duration_days || 3}-Day AI Personalized Meal Plan (Balanced)`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI MEAL PLANNER
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create a personalized nutrition plan based on goals and food preferences
        </p>
      </div>

      {/* Main Layout: Configuration Form & Meal Plan Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Personalize Your Plan Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              PERSONALIZE YOUR PLAN
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="lightly_active">Lightly Active (1–3 days/week)</option>
                <option value="moderately_active">Moderately Active (3–5 days/week)</option>
                <option value="very_active">Very Active (6–7 days/week)</option>
                <option value="extra_active">Extra Active (Athlete / physical job)</option>
              </select>
            </div>

            {/* Health Goal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Health Goal</label>
              <select
                value={healthGoal}
                onChange={(e) => setHealthGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="weight_loss">Weight Loss (-500 kcal deficit)</option>
                <option value="muscle_gain">Muscle Gain (+350 kcal surplus)</option>
                <option value="maintenance">Maintenance (Equilibrium)</option>
                <option value="athletic_performance">Athletic Performance & Glycogen</option>
              </select>
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Diet Preference</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="balanced">Balanced / High-Protein</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">100% Plant-Based Vegan</option>
                <option value="keto">Ketogenic (Very Low Carb)</option>
                <option value="paleo">Paleo Clean Eating</option>
                <option value="gluten_free">Strict Gluten-Free</option>
              </select>
            </div>

            {/* Food Allergies & Restrictions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-700">
                  Food Allergies & Restrictions
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {selectedAllergies.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ALLERGEN_OPTIONS.map((opt) => {
                  const checked = selectedAllergies.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleAllergy(opt.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition select-none flex items-center justify-between ${
                        checked
                          ? "bg-rose-50 border-rose-300 text-rose-800"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${checked ? "border-rose-600 bg-rose-600" : "border-slate-300 bg-white"}`}>
                        {checked && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Duration Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="duration-input" className="text-[11px] font-semibold text-slate-700">
                  Plan Duration
                </label>
                <span className="text-[10px] text-slate-400 font-medium">1 – 90 days</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5">
                {/* Minus Button */}
                <button
                  type="button"
                  disabled={durationDays <= 1}
                  onClick={() => handleDurationChange(durationDays - 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-base hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs shrink-0 select-none cursor-pointer"
                  aria-label="Decrease duration by 1 day"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Number Input & Days label */}
                <div className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-xl h-9 px-3 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                  <input
                    id="duration-input"
                    type="number"
                    min={1}
                    max={90}
                    step={1}
                    value={durationInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={handleInputBlur}
                    className="w-12 text-center text-sm font-bold text-slate-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-semibold text-slate-500 select-none">
                    {durationDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                {/* Plus Button */}
                <button
                  type="button"
                  disabled={durationDays >= 90}
                  onClick={() => handleDurationChange(durationDays + 1)}
                  className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base hover:bg-emerald-700 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs shrink-0 select-none cursor-pointer"
                  aria-label="Increase duration by 1 day"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {generateMutation.isError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <span>{(generateMutation.error as Error)?.message || "Failed to generate meal plan. Please try again."}</span>
                <button
                  type="button"
                  onClick={() => generateMutation.reset()}
                  className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Generate Meal Plan Button */}
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {generateMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Your Meal Plan...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Generate Meal Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Your Personalized Meal Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Your Personalized Meal Plan
            </h2>

            {activePlan && (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/grocery"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 transition shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>View Grocery List</span>
                </Link>
              </div>
            )}
          </div>

          {activePlan ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* Plan Metadata & Status */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    PLAN READY
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Adherence: <b>{activePlan.adherence_score || 100}%</b>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: {Math.round(activePlan.target_calories)} kcal • {Math.round(activePlan.target_protein)}g P • {Math.round(activePlan.target_carbs)}g C • {Math.round(activePlan.target_fats)}g F
                </p>
              </div>

              {/* Dynamic Day / Week Navigation */}
              {activePlan.days && activePlan.days.length > 0 && (() => {
                const totalPlanDays = activePlan.days.length;
                const totalWeeks = Math.ceil(totalPlanDays / 7);

                return (
                  <div className="space-y-3">
                    {/* Multi-Week Tabs (rendered when plan > 7 days) */}
                    {totalWeeks > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                          Weeks:
                        </span>
                        {Array.from({ length: totalWeeks }, (_, wIdx) => {
                          const weekNum = wIdx + 1;
                          const startDay = wIdx * 7 + 1;
                          const endDay = Math.min(totalPlanDays, weekNum * 7);
                          const isWeekActive = activeWeekTab === weekNum;

                          return (
                            <button
                              key={weekNum}
                              type="button"
                              onClick={() => {
                                setActiveWeekTab(weekNum);
                                const firstDayOfWeekIdx = wIdx * 7;
                                setSelectedDayIndex(firstDayOfWeekIdx);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border select-none cursor-pointer ${
                                isWeekActive
                                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <span>Week {weekNum}</span>
                              <span className={`text-[10px] font-medium ${isWeekActive ? "text-emerald-400" : "text-slate-400"}`}>
                                (Days {startDay}–{endDay})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Day Selector Tabs & Stepper */}
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                        {(totalWeeks > 1
                          ? activePlan.days.slice((activeWeekTab - 1) * 7, activeWeekTab * 7)
                          : activePlan.days
                        ).map((day) => {
                          const realIdx = day.day_number - 1;
                          const isSelected = selectedDayIndex === realIdx;

                          return (
                            <button
                              key={day.day_number}
                              type="button"
                              onClick={() => setSelectedDayIndex(realIdx)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 border select-none cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Day {day.day_number} ({day.day_name.slice(0, 3)})</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Day Stepper Controls */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          disabled={selectedDayIndex <= 0}
                          onClick={() => setSelectedDayIndex((prev) => Math.max(0, prev - 1))}
                          className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Previous Day"
                          aria-label="Previous Day"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-bold text-slate-700 px-1 select-none whitespace-nowrap">
                          Day {selectedDayIndex + 1} of {totalPlanDays}
                        </span>
                        <button
                          type="button"
                          disabled={selectedDayIndex >= totalPlanDays - 1}
                          onClick={() => setSelectedDayIndex((prev) => Math.min(totalPlanDays - 1, prev + 1))}
                          className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                          title="Next Day"
                          aria-label="Next Day"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* DAILY NUTRITION SUMMARY dark green banner */}
              {currentDay && (
                <div className="bg-[#052e16] text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
                      DAILY NUTRITION SUMMARY
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {currentDay.day_name} Nutrition
                    </h3>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Nutrition Checks Passed</span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-xs pt-0.5">
                      <div>
                        <span className="text-[10px] text-emerald-400/80 block uppercase font-bold tracking-wider">CALORIES</span>
                        <span className="text-sm font-bold text-white">{Math.round(currentDay.total_calories)} kcal</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400/80 block uppercase font-bold tracking-wider">PROTEIN</span>
                        <span className="text-sm font-bold text-white">{Math.round(currentDay.total_protein * 10) / 10}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400/80 block uppercase font-bold tracking-wider">CARBS</span>
                        <span className="text-sm font-bold text-white">{Math.round(currentDay.total_carbs * 10) / 10}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400/80 block uppercase font-bold tracking-wider">FATS</span>
                        <span className="text-sm font-bold text-white">{Math.round(currentDay.total_fats * 10) / 10}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Cards Grid (2x2 on desktop) */}
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
                Configure your biometrics and preferences on the left, then click <b>Generate Meal Plan</b> to synthesize your schedule!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
