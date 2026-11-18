export interface User {
  id: number;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DietaryProfile {
  id: number;
  user_id: number;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activity_level: string;
  health_goal: string;
  diet_type: string;
  allergies?: string;
  disliked_ingredients?: string;
  medical_conditions?: string;
  bmr?: number;
  tdee?: number;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fats_g?: number;
  created_at: string;
  updated_at: string;
}

export interface IngredientItem {
  name: string;
  quantity: number;
  unit: string;
  aisle: string;
}

export interface MealItem {
  id: string;
  meal_type: string;
  name: string;
  description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: IngredientItem[];
  instructions: string[];
  allergens: string[];
}

export interface DayMealPlan {
  day_number: number;
  day_name: string;
  meals: MealItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface VerificationResult {
  passed: boolean;
  allergen_violations: string[];
  calorie_deviation_pct: number;
  confidence_score: number;
  retry_count: number;
  violations: Array<{ rule: string; description: string; severity: string }>;
  remarks: string;
}

export interface MealPlan {
  id: number;
  user_id: number;
  title: string;
  duration_days: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  days: DayMealPlan[];
  verification: VerificationResult;
  grocery_list: Record<string, string[]>;
  adherence_score: number;
  is_active: boolean;
  created_at: string;
}

export interface LoggedMealItem {
  meal_type: string;
  name: string;
  summary?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  completed: boolean;
}

export interface NutritionLog {
  id: number;
  user_id: number;
  log_date: string;
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fats: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  items: LoggedMealItem[];
  notes?: string;
  created_at: string;
}

export interface BenchmarkScenarioResult {
  scenario_id: string;
  scenario_name: string;
  passed: boolean;
  allergen_compliance: boolean;
  calorie_compliance: boolean;
  macro_balance_score: number;
  execution_time_seconds: number;
  retry_count: number;
  remarks: string;
  details: Record<string, any>;
}

export interface BenchmarkSuiteSummary {
  total_scenarios: number;
  passed_scenarios: number;
  overall_accuracy_pct: number;
  allergen_adherence_pct: number;
  calorie_adherence_pct: number;
  average_latency_seconds: number;
  max_latency_seconds: number;
  results: BenchmarkScenarioResult[];
  system_status: string;
}
