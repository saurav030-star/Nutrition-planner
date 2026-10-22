from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict, total=False):
    # Inputs
    user_id: int
    age: int
    gender: str
    weight: float
    height: float
    activity_level: str
    health_goal: str
    diet_type: str
    allergies: List[str]
    disliked_ingredients: List[str]
    duration_days: int
    
    # Overrides
    target_calories_override: Optional[float]
    
    # Profile Analyzer Outputs
    bmr: float
    tdee: float
    target_calories: float
    parsed_allergens: List[str]
    
    # Macro Optimizer Outputs
    target_protein_g: float
    target_carbs_g: float
    target_fats_g: float
    macro_split: Dict[str, float]  # {"protein_pct": 0.30, "carbs_pct": 0.40, "fats_pct": 0.30}
    
    # Recipe Generator Outputs
    generated_days: List[Dict[str, Any]]
    grocery_list: Dict[str, List[str]]
    agent_logs: List[Dict[str, str]]
    
    # Constraint Verifier Outputs
    is_valid: bool
    violations: List[Dict[str, Any]]
    allergen_violations: List[str]
    calorie_deviation_pct: float
    confidence_score: float
    remarks: str
    feedback: str
    retry_count: int
    max_retries: int
