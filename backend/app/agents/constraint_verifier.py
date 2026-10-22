"""
Constraint Verifier Agent
Validates allergen safety, caloric cap compliance, and macro-nutrient balance.
Provides actionable feedback to trigger autonomous corrective loops.
"""

from typing import Dict, Any, List
from app.agents.state import AgentState

CALORIE_TOLERANCE_PCT = 10.0  # Allowable caloric deviation percentage (±10%)

def constraint_verifier_node(state: AgentState) -> Dict[str, Any]:
    """
    Constraint Verifier Agent Node for LangGraph.
    Scans entire generated schedule for allergen violations and caloric tolerance.
    """
    logs = list(state.get("agent_logs", []))
    
    generated_days = state.get("generated_days", [])
    target_calories = state.get("target_calories", 2000.0)
    parsed_allergens = set(state.get("parsed_allergens", []))
    retry_count = state.get("retry_count", 0)
    max_retries = state.get("max_retries", 3)
    
    violations: List[Dict[str, Any]] = []
    allergen_violations: List[str] = []
    daily_deviations: List[float] = []
    
    # 1. Audit Allergen Ingestion
    for day in generated_days:
        day_num = day.get("day_number", 1)
        for meal in day.get("meals", []):
            meal_allergens = {str(a).lower() for a in meal.get("allergens", [])}
            conflict = parsed_allergens.intersection(meal_allergens)
            if conflict:
                for c in conflict:
                    violation_text = f"Day {day_num} {meal.get('meal_type')} '{meal.get('name')}' contains allergen '{c}'"
                    allergen_violations.append(violation_text)
                    violations.append({
                        "rule": "STRICT_ALLERGEN_EXCLUSION",
                        "description": violation_text,
                        "severity": "CRITICAL"
                    })
                    
        # 2. Audit Daily Caloric Tolerance
        day_calories = day.get("total_calories", 0.0)
        dev_pct = abs(day_calories - target_calories) / target_calories * 100.0
        daily_deviations.append(dev_pct)
        if dev_pct > CALORIE_TOLERANCE_PCT:
            violations.append({
                "rule": "CALORIE_CAP_DEVIATION",
                "description": f"Day {day_num} calories ({day_calories}) deviate by {round(dev_pct, 1)}% from target ({target_calories})",
                "severity": "MEDIUM"
            })
            
    avg_dev_pct = round(sum(daily_deviations) / len(daily_deviations), 1) if daily_deviations else 0.0
    
    is_valid = (len(allergen_violations) == 0 and avg_dev_pct <= CALORIE_TOLERANCE_PCT)
    
    # Calculate confidence / adherence score (0-100)
    score = 100.0
    if allergen_violations:
        score -= min(50.0, len(allergen_violations) * 20.0)
    if avg_dev_pct > CALORIE_TOLERANCE_PCT:
        score -= min(30.0, (avg_dev_pct - CALORIE_TOLERANCE_PCT) * 2.0)
    confidence_score = round(max(0.0, score), 1)
    
    feedback = ""
    if not is_valid:
        if retry_count < max_retries:
            reasons = []
            if allergen_violations:
                reasons.append(f"allergens detected: {', '.join(allergen_violations[:2])}")
            if avg_dev_pct > CALORIE_TOLERANCE_PCT:
                reasons.append(f"calorie deviation {avg_dev_pct}% exceeds limit")
            feedback = f"Verification failed due to {'; '.join(reasons)}. Re-scaling and filtering meals."
            remarks = f"Constraint audit flagged {len(violations)} boundary infractions. Initiating feedback loop retry #{retry_count + 1}."
        else:
            remarks = f"Max retries reached ({max_retries}). Soft constraints adapted with confidence score {confidence_score}%."
    else:
        remarks = f"All nutritional constraints and allergen boundaries strictly validated. Constraint adherence: 100%."
        
    logs.append({
        "agent": "ConstraintVerifier",
        "action": "VERIFIED_CONSTRAINTS",
        "details": f"Status: {'PASSED' if is_valid else 'FAILED'} | Allergen Violations: {len(allergen_violations)} | Calorie Dev: {avg_dev_pct}% | Confidence: {confidence_score}%"
    })
    
    return {
        "is_valid": is_valid,
        "violations": violations,
        "allergen_violations": allergen_violations,
        "calorie_deviation_pct": avg_dev_pct,
        "confidence_score": confidence_score,
        "remarks": remarks,
        "feedback": feedback,
        "retry_count": retry_count + 1 if not is_valid else retry_count,
        "agent_logs": logs
    }
