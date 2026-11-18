#!/usr/bin/env python3
"""
TaskBench Evaluation Benchmark Runner
Assesses system correctness, constraint-adherence accuracy, and agent execution times.
Project: Enterprise-Grade AI Nutrition Planner
"""


import sys
import os

# Ensure backend root is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.api.benchmark import run_benchmark_suite

def main():
    print("=" * 80)
    print("🚀 ENTERPRISE-GRADE AI NUTRITION PLANNER: TASKBENCH EVALUATION BENCHMARK")
    print("   Autonomous Multi-Agent LangGraph Constraint & Latency Audit")
    print("=" * 80)
    print("Executing Autonomous Multi-Agent LangGraph Benchmark Test Suite...\n")

    
    summary = run_benchmark_suite()
    
    print("-" * 80)
    print(f"{'ID':<7} | {'Scenario Name':<42} | {'Time (s)':<9} | {'Allergen':<9} | {'Status':<8}")
    print("-" * 80)
    
    for r in summary.results:
        status_symbol = "✅ PASS" if r.passed else "❌ FAIL"
        allergen_status = "100% OK" if r.allergen_compliance else "VIOLATION"
        print(f"{r.scenario_id:<7} | {r.scenario_name[:42]:<42} | {r.execution_time_seconds:<9.3f} | {allergen_status:<9} | {status_symbol:<8}")
        
    print("-" * 80)
    print(f"\n📊 AGGREGATE BENCHMARK PERFORMANCE METRICS:")
    print(f" • Total Evaluation Scenarios : {summary.total_scenarios}")
    print(f" • Passed Scenarios           : {summary.passed_scenarios} / {summary.total_scenarios}")
    print(f" • Overall Constraint Accuracy: {summary.overall_accuracy_pct}% (Target: >85%)")
    print(f" • Allergen Exclusion Shield  : {summary.allergen_adherence_pct}%")
    print(f" • Caloric Bound Adherence    : {summary.calorie_adherence_pct}%")
    print(f" • Average Execution Latency  : {summary.average_latency_seconds:.3f} seconds (Target: <4.0s)")
    print(f" • Maximum Latency Recorded   : {summary.max_latency_seconds:.3f} seconds")
    print(f" • System Health / Readiness  : {summary.system_status}")
    print("=" * 80)
    
    if summary.overall_accuracy_pct >= 85.0 and summary.average_latency_seconds < 4.0:
        print("🎯 EVALUATION OUTCOME: SYSTEM FULLY VALIDATED AND EXCEEDS THRESHOLDS.\n")
        sys.exit(0)
    else:
        print("⚠️ EVALUATION OUTCOME: METRICS REQUIRE ADJUSTMENT.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
