"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";
import { MealPlan } from "@/lib/types";
import { 
  ShoppingBag, 
  Download, 
  CheckCircle2, 
  ChefHat, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Apple, 
  Beef, 
  Milk, 
  Wheat, 
  Package 
} from "lucide-react";

export default function GroceryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
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

  // Restore checked items from localStorage for the active plan
  useEffect(() => {
    if (activePlan?.id) {
      try {
        const saved = localStorage.getItem(`grocery_checked_${activePlan.id}`);
        if (saved) {
          setCheckedItems(JSON.parse(saved));
        }
      } catch (_) {}
    }
  }, [activePlan?.id]);

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => {
      const updated = {
        ...prev,
        [itemKey]: !prev[itemKey],
      };
      if (activePlan?.id) {
        try {
          localStorage.setItem(`grocery_checked_${activePlan.id}`, JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
  };

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const handleDownloadPdf = async () => {
    if (!activePlan) return;
    try {
      setDownloading(true);
      await api.downloadMealPlanPdfBlob(activePlan.id, `Grocery_List_${activePlan.id}.pdf`);
    } catch (_) {
      window.open(api.downloadMealPlanPdfUrl(activePlan.id), "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const parseGroceryItem = (item: string) => {
    const colonIdx = item.indexOf(":");
    if (colonIdx !== -1) {
      return {
        name: item.slice(0, colonIdx).trim(),
        quantity: item.slice(colonIdx + 1).trim(),
      };
    }
    return { name: item, quantity: "" };
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("produce") || cat.includes("fruit") || cat.includes("veg")) {
      return <Apple className="w-3.5 h-3.5" />;
    }
    if (cat.includes("meat") || cat.includes("seafood") || cat.includes("poultry") || cat.includes("fish")) {
      return <Beef className="w-3.5 h-3.5" />;
    }
    if (cat.includes("dairy") || cat.includes("refrigerat") || cat.includes("egg") || cat.includes("milk")) {
      return <Milk className="w-3.5 h-3.5" />;
    }
    if (cat.includes("bakery") || cat.includes("grain") || cat.includes("bread") || cat.includes("cereal")) {
      return <Wheat className="w-3.5 h-3.5" />;
    }
    if (cat.includes("pantry") || cat.includes("spice") || cat.includes("condiment") || cat.includes("oil")) {
      return <Package className="w-3.5 h-3.5" />;
    }
    return <ShoppingBag className="w-3.5 h-3.5" />;
  };

  if (!mounted) return null;

  const groceryList = activePlan?.grocery_list || {};
  const totalItems = Object.values(groceryList).reduce((acc, items) => acc + (items ? items.length : 0), 0);
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Smart Grocery List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All the ingredients you need for your meal plan, organized by category for easier shopping.
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center gap-2.5 shrink-0 print:hidden">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Downloading..." : "Download Grocery List"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print List</span>
            </button>
          </div>
        )}
      </div>

      {activePlan && totalItems > 0 ? (
        <div className="space-y-6">
          {/* Shopping Progress Compact Bar */}
          <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Shopping Progress:
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {completedCount} / {totalItems} items collected
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({progressPct}%)
                  </span>
                </div>
                <div className="w-48 sm:w-64 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>For Plan:</span>
              <b className="text-slate-800 font-semibold">{activePlan.title}</b>
            </div>
          </div>

          {/* Categories Grid (2-column on desktop, 1-column on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {Object.entries(groceryList).map(([categoryName, items]) => {
              if (!items || items.length === 0) return null;

              const isExpanded = !!expandedCategories[categoryName];
              const displayedItems = isExpanded ? items : items.slice(0, 5);
              const hasMore = items.length > 5;

              return (
                <div
                  key={categoryName}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        {getCategoryIcon(categoryName)}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{categoryName}</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Items List */}
                  <ul className="space-y-1 flex-1">
                    {displayedItems.map((item, idx) => {
                      const itemKey = `${categoryName}-${idx}-${item}`;
                      const isChecked = !!checkedItems[itemKey];
                      const { name, quantity } = parseGroceryItem(item);

                      return (
                        <li
                          key={idx}
                          onClick={() => toggleItem(itemKey)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition select-none flex items-center justify-between gap-3 ${
                            isChecked
                              ? "bg-emerald-50/40 border-emerald-200/60 text-slate-400"
                              : "bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100/70 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                                isChecked
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </div>
                            <span
                              className={`font-medium truncate ${
                                isChecked ? "line-through text-slate-400" : "text-slate-800"
                              }`}
                            >
                              {name}
                            </span>
                          </div>

                          {quantity && (
                            <span
                              className={`text-[11px] shrink-0 font-normal ${
                                isChecked ? "line-through text-slate-300" : "text-slate-400"
                              }`}
                            >
                              {quantity}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* View All / Show Less Toggle Button */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand(categoryName)}
                      className="w-full pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                    >
                      <span>{isExpanded ? "Show less" : `View all (${items.length} items)`}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Grocery List Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate your personalized meal plan first, and your ingredients will automatically appear here organized by category for easy shopping.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            <ChefHat className="w-4 h-4" />
            <span>Create Meal Plan</span>
          </Link>
        </div>
      )}
    </div>
  );
}