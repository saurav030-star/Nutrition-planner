"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";
import { MealPlan } from "@/lib/types";
import { 
  ShoppingCart, 
  Download, 
  CheckCircle2, 
  ChefHat, 
  Printer, 
  Sparkles, 
  Layers 
} from "lucide-react";

export default function GroceryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const { data: activePlan, isLoading } = useQuery<MealPlan>({
    queryKey: ["activeMealPlan"],
    queryFn: () => api.getActiveMealPlan().catch(() => null),
  });

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

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


  if (!mounted) return null;

  const groceryList = activePlan?.grocery_list || {};
  const totalItems = Object.values(groceryList).reduce((acc, items) => acc + items.length, 0);
  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Commercial FoodTech Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Supermarket Aisle-by-Aisle Grocery Manifest
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingredients consolidated and routed into supermarket fulfillment zones for efficient supply chain acquisition
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{downloading ? "Downloading..." : "Download Publication PDF"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        )}

      </div>

      {activePlan ? (
        <div className="space-y-6">
          {/* Progress Bar Banner */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Fulfillment Progress: {completedCount} / {totalItems} items gathered
              </span>
              <div className="w-64 bg-slate-100 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${totalItems ? (completedCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Assigned to plan: <b>{activePlan.title}</b>
            </div>
          </div>

          {/* Aisle Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(groceryList).map(([aisle, items]) => {
              if (!items || items.length === 0) return null;

              return (
                <div key={aisle} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{aisle}</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      {items.length} items
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {items.map((item, idx) => {
                      const itemKey = `${aisle}-${idx}-${item}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <li
                          key={idx}
                          onClick={() => toggleItem(itemKey)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition select-none flex items-center justify-between gap-2 ${
                            isChecked
                              ? "bg-emerald-50/60 border-emerald-300 text-slate-400 line-through"
                              : "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-medium">{item}</span>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                              isChecked
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Grocery Manifest Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate your personalized meal plan first using the autonomous multi-agent pipeline to automatically categorize your ingredients.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            <ChefHat className="w-4 h-4" />
            <span>Go to AI Planner</span>
          </Link>
        </div>
      )}
    </div>
  );
}
