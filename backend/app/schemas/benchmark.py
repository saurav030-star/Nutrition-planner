from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class BenchmarkScenario(BaseModel):
    id: str
    name: str
    description: str
    profile_data: Dict[str, Any]
    expected_constraints: Dict[str, Any]

class BenchmarkScenarioResult(BaseModel):
    scenario_id: str
    scenario_name: str
    passed: bool
    allergen_compliance: bool
    calorie_compliance: bool
    macro_balance_score: float
    execution_time_seconds: float
    retry_count: int
    remarks: str
    details: Dict[str, Any]

class BenchmarkSuiteSummary(BaseModel):
    total_scenarios: int
    passed_scenarios: int
    overall_accuracy_pct: float
    allergen_adherence_pct: float
    calorie_adherence_pct: float
    average_latency_seconds: float
    max_latency_seconds: float
    results: List[BenchmarkScenarioResult]
    system_status: str  # "EXCEEDS_REQUIREMENT" if >85% accuracy and <4.0s latency
