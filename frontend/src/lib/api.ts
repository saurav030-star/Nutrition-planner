const DEFAULT_DEMO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MjY0NTc2MDEsInN1YiI6IjEifQ.Ua2IfKr_jkMv9Bb70tBcaRlBrEem4skPywbXkUC2_R0";
const DEFAULT_USER = { id: 1, email: "nitish@nutrigraph.ai", full_name: "Nitish" };

const API_BASE = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api");

export function getAuthToken(): string {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("auth_token");
    if (!token) {
      token = DEFAULT_DEMO_TOKEN;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(DEFAULT_USER));
    }
    return token;
  }
  return DEFAULT_DEMO_TOKEN;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

export function getStoredUser() {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : DEFAULT_USER;
  }
  return DEFAULT_USER;
}

export function setStoredUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return response.json();
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please verify that the backend server is running on port 8000.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Auth
  register: (data: any) => request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request<any>("/auth/me"),

  // Profile
  getProfile: () => request<any>("/profile"),
  updateProfile: (data: any) => request<any>("/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Meal Plans
  generateMealPlan: (data: any) => request<any>("/meal-plans/generate", { method: "POST", body: JSON.stringify(data) }),
  getActiveMealPlan: () => request<any>("/meal-plans/active"),
  getAllMealPlans: () => request<any>("/meal-plans"),
  getMealPlanById: (id: number) => request<any>(`/meal-plans/${id}`),
  deleteMealPlan: (id: number) => request<any>(`/meal-plans/${id}`, { method: "DELETE" }),
  
  // PDF Export
  downloadMealPlanPdfUrl: (id: number) => `${API_BASE}/meal-plans/${id}/pdf`,

  // Logs
  getNutritionLogs: (days = 7) => request<any[]>(`/logs?days=${days}`),
  logDailyIntake: (data: any) => request<any>("/logs", { method: "POST", body: JSON.stringify(data) }),

  // Benchmark
  runBenchmarks: () => request<any>("/benchmark/run", { method: "POST" }),
};
