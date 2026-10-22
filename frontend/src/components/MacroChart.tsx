"use client";

import { useEffect, useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";

interface MacroChartProps {
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  calories: number;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B"];

export default function MacroChart({
  proteinGrams,
  carbsGrams,
  fatsGrams,
  calories,
}: MacroChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const proteinCalories = proteinGrams * 4;
  const carbsCalories = carbsGrams * 4;
  const fatsCalories = fatsGrams * 9;
  const totalCal = proteinCalories + carbsCalories + fatsCalories || calories || 2000;

  const data = [
    { name: "Protein", value: Math.round(proteinCalories), grams: proteinGrams, color: COLORS[0] },
    { name: "Carbs", value: Math.round(carbsCalories), grams: carbsGrams, color: COLORS[1] },
    { name: "Fats", value: Math.round(fatsCalories), grams: fatsGrams, color: COLORS[2] },
  ];

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Loading interactive chart...
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Donut Chart */}
      <div className="w-48 h-48 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} kcal`, name]}
              contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900">{Math.round(calories)}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">kcal / day</span>
        </div>
      </div>

      {/* Legend & Gram stats */}
      <div className="flex-1 space-y-3 w-full">
        {data.map((item) => {
          const pct = Math.round((item.value / totalCal) * 100);
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-slate-900">{item.grams}g ({pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
