"use client";

import { 
  UserCheck, 
  PieChart, 
  UtensilsCrossed, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";

interface AgentVisualizerProps {
  currentStage?: "idle" | "profile" | "macros" | "recipes" | "verifier" | "completed";
  verificationScore?: number;
  retryCount?: number;
}

export default function AgentVisualizer({
  currentStage = "completed",
  verificationScore = 100,
  retryCount = 0,
}: AgentVisualizerProps) {
  const steps = [
    {
      id: "profile",
      name: "Profile Analyzer",
      role: "Mifflin-St Jeor Engine",
      desc: "Calculates BMR & TDEE from biometrics, extracts allergen constraints",
      icon: UserCheck,
    },
    {
      id: "macros",
      name: "Macro Optimizer",
      role: "Nutritional Distribution",
      desc: "Optimizes target protein, carb, and fat gram ratios",
      icon: PieChart,
    },
    {
      id: "recipes",
      name: "Recipe Generator",
      role: "Culinary AI Synthesis",
      desc: "Constructs multi-day meals & aggregates supermarket aisles",
      icon: UtensilsCrossed,
    },
    {
      id: "verifier",
      name: "Constraint Verifier",
      role: "Safety & Calorie Audit",
      desc: "Scans for allergen leaks & triggers feedback loop if bounds violated",
      icon: ShieldCheck,
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (currentStage === "completed") return "done";
    const order = ["profile", "macros", "recipes", "verifier"];
    const currentIdx = order.indexOf(currentStage);
    const stepIdx = order.indexOf(stepId);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-semibold text-slate-100">
              LangGraph Multi-Agent Orchestration DAG
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directed Acyclic Graph with autonomous self-correcting feedback cycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          {retryCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Corrective Retries: {retryCount}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/60 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Adherence Score: {verificationScore}%</span>
          </div>
        </div>
      </div>

      {/* Grid of Agent Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const status = getStepStatus(step.id);

          return (
            <div key={step.id} className="relative flex flex-col">
              <div
                className={`p-4 rounded-xl border transition-all h-full ${
                  status === "active"
                    ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : status === "done"
                    ? "bg-slate-800/80 border-slate-700"
                    : "bg-slate-900/60 border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      status === "active"
                        ? "bg-emerald-500 text-slate-950"
                        : status === "done"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Node {idx + 1}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">{step.name}</h4>
                <span className="text-xs text-emerald-400 font-medium block mt-0.5">{step.role}</span>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Self-Correction Loop Banner */}
      <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>
            <b>Autonomous Cycle:</b> If Constraint Verifier flags calorie deviation &gt; 10% or allergen violation, graph conditionally routes back to Recipe Generator.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">Max Retries: 3</span>
      </div>
    </div>
  );
}
