"use client";

import { useState } from "react";
import { MealItem } from "@/lib/types";
import { 
  Clock, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  Utensils 
} from "lucide-react";

interface MealCardProps {
  meal: MealItem;
}

export default function MealCard({ meal }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getMealBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "lunch":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "dinner":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "snack":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getMealBadgeColor(
              meal.meal_type
            )}`}
          >
            {meal.meal_type}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{meal.prep_time_minutes + meal.cook_time_minutes} mins</span>
          </div>
        </div>

        <h4 className="text-base font-bold text-slate-900 leading-snug">{meal.name}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {meal.description}
        </p>

        {/* Nutritional Macro Badges */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50 rounded-lg p-2">
            <span className="block text-[10px] uppercase font-semibold text-slate-500">Calories</span>
            <span className="text-xs font-bold text-slate-900">{Math.round(meal.calories)}</span>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2">
            <span className="block text-[10px] uppercase font-semibold text-emerald-700">Protein</span>
            <span className="text-xs font-bold text-emerald-800">{meal.protein}g</span>
          </div>
          <div className="bg-sky-50 rounded-lg p-2">
            <span className="block text-[10px] uppercase font-semibold text-sky-700">Carbs</span>
            <span className="text-xs font-bold text-sky-800">{meal.carbs}g</span>
          </div>
          <div className="bg-amber-50 rounded-lg p-2">
            <span className="block text-[10px] uppercase font-semibold text-amber-700">Fats</span>
            <span className="text-xs font-bold text-amber-800">{meal.fats}g</span>
          </div>
        </div>

        {/* Allergens */}
        <div className="mt-3 flex items-center justify-between">
          {meal.allergens && meal.allergens.length > 0 ? (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Contains: {meal.allergens.join(", ")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Allergen Safe</span>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>{expanded ? "Hide Details" : "Ingredients & Prep"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Details */}
      {expanded && (
        <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-4 text-xs">
          <div>
            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              Required Ingredients ({meal.ingredients.length})
            </h5>
            <ul className="space-y-1.5 pl-1">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="flex justify-between items-center text-slate-700">
                  <span>• {ing.name}</span>
                  <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {ing.quantity} {ing.unit} <span className="text-[10px] text-slate-400 font-normal">({ing.aisle})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">
              Chef Instructions
            </h5>
            <ol className="space-y-1.5 list-decimal list-inside text-slate-600 leading-relaxed">
              {meal.instructions.map((step, idx) => (
                <li key={idx} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
