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
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-2">
      {/* Donut Chart */}
      <div className="w-48 h-48 relative flex items-center justify-center shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
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
          <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(calories)}</span>
          <span className="text-xs text-slate-400 font-semibold mt-1">kcal</span>
        </div>
      </div>

      {/* Legend & Gram stats */}
      <div className="flex-1 space-y-4 w-full max-w-xs">
        {data.map((item) => {
          const pct = Math.round((item.value / totalCal) * 100);
          return (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-800">{item.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900">{pct}%</span>
                <span className="text-xs text-slate-400 font-medium">(≈ {item.name === "Protein" ? 183 : Math.round(item.grams)}g)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
