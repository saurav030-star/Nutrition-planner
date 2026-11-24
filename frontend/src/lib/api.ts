function getApiBase(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  url = url.trim();
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE = getApiBase();

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
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
    return raw ? JSON.parse(raw) : null;
  }
  return null;
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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
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
  downloadMealPlanPdfUrl: (id: number) => {
    const token = getAuthToken();
    return `${API_BASE}/meal-plans/${id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  },
  downloadMealPlanPdfBlob: async (id: number, filename = `Nutrition_Plan_${id}.pdf`) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const url = `${API_BASE}/meal-plans/${id}/pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download PDF (HTTP ${response.status})`);
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
  },


  // Logs
  getNutritionLogs: (days = 7) => request<any[]>(`/logs?days=${days}`),
  logDailyIntake: (data: any) => request<any>("/logs", { method: "POST", body: JSON.stringify(data) }),

  // Benchmark
  runBenchmarks: () => request<any>("/benchmark/run", { method: "POST" }),
};
