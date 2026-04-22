/**
 * KisanTrust API Service
 * 
 * Centralized HTTP client for all backend API calls.
 * Handles JWT token management, request/response formatting.
 */

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");
const API_BASE = VITE_BACKEND_URL ? `${VITE_BACKEND_URL}/api` : "http://localhost:3000/api";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export function getToken(): string | null {
  return localStorage.getItem("kisantrust_token");
}

export function setToken(token: string) {
  localStorage.setItem("kisantrust_token", token);
}

export function removeToken() {
  localStorage.removeItem("kisantrust_token");
}

export function getLenderToken(): string | null {
  return localStorage.getItem("kisantrust_lender_token");
}

export function setLenderToken(token: string) {
  localStorage.setItem("kisantrust_lender_token", token);
}

export function removeLenderToken() {
  localStorage.removeItem("kisantrust_lender_token");
}

// ---------------------------------------------------------------------------
// Base fetch wrapper
// ---------------------------------------------------------------------------
async function request(
  endpoint: string,
  options: RequestInit = {},
  tokenOverride?: string | null
) {
  const token = tokenOverride ?? getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Auth API (Farmer)
// ---------------------------------------------------------------------------
export const auth = {
  async register(body: {
    name: string;
    phone: string;
    password: string;
    village?: string;
    state?: string;
    landsize: number;
    cropTypes?: string[];
  }) {
    return request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async login(phone: string, password: string) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
  },

  async logout() {
    return request("/auth/logout", { method: "POST" });
  },

  async getProfile() {
    return request("/auth/profile");
  },

  async updateProfile(body: Record<string, any>) {
    return request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
};

// ---------------------------------------------------------------------------
// Fields API
// ---------------------------------------------------------------------------
export const fields = {
  async create(body: {
    fieldName: string;
    areaSize: number;
    currentCrop?: string;
    location: { latitude: number; longitude: number; village?: string; state?: string };
  }) {
    return request("/fields", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getAll() {
    return request("/fields");
  },

  async update(id: string, body: Record<string, any>) {
    return request(`/fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  async remove(id: string) {
    return request(`/fields/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Diagnosis API
// ---------------------------------------------------------------------------
export const diagnosis = {
  async create(formData: FormData) {
    return request("/diagnosis", {
      method: "POST",
      body: formData,
    });
  },

  async getAll(params?: { cropType?: string; fieldId?: string }) {
    const query = new URLSearchParams();
    if (params?.cropType) query.set("cropType", params.cropType);
    if (params?.fieldId) query.set("fieldId", params.fieldId);
    const qs = query.toString();
    return request(`/diagnosis${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string) {
    return request(`/diagnosis/${id}`);
  },

  async createFollowUp(originalId: string, formData: FormData) {
    return request(`/diagnosis/${originalId}/follow-up`, {
      method: "POST",
      body: formData,
    });
  },
};

// ---------------------------------------------------------------------------
// Score API
// ---------------------------------------------------------------------------
export const score = {
  async get() {
    return request("/score");
  },

  async getBreakdown() {
    return request("/score/breakdown");
  },

  async getFeatures() {
    return request("/score/features");
  },
};

// ---------------------------------------------------------------------------
// Lender API
// ---------------------------------------------------------------------------
export const lender = {
  async register(body: {
    organizationName: string;
    contactPerson: string;
    email: string;
    password: string;
    licenseNumber: string;
  }) {
    return request("/lenders/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async login(email: string, password: string) {
    return request("/lenders/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async viewFarmer(phone: string) {
    return request(`/lenders/farmers/${phone}`, {}, getLenderToken());
  },

  async processLoan(body: {
    farmerPhone: string;
    amountRequested: number;
    purpose: string;
    status?: string;
    lenderNote?: string;
  }) {
    return request("/lenders/loan-applications", {
      method: "POST",
      body: JSON.stringify(body),
    }, getLenderToken());
  },

  async getLoans() {
    return request("/lenders/loan-applications", {}, getLenderToken());
  },
};

// ---------------------------------------------------------------------------
// Image upload (standalone)
// ---------------------------------------------------------------------------
export const upload = {
  async uploadImage(formData: FormData) {
    return request("/upload", {
      method: "POST",
      body: formData,
    });
  },
};

// ---------------------------------------------------------------------------
// Loan Applications API
// ---------------------------------------------------------------------------
export const loans = {
  // Farmer: apply for a loan
  async apply(body: { amountRequested: number; purpose: string; description?: string; cropType?: string }) {
    return request("/loans/apply", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Farmer: get my applications
  async getMyApplications() {
    return request("/loans/my-applications");
  },

  // Lender: get leaderboard (all pending applications)
  async getLeaderboard() {
    return request("/loans/leaderboard", {}, getLenderToken());
  },

  // Lender: review (approve/reject) an application
  async review(id: string, body: { status: string; lenderNote?: string }) {
    return request(`/loans/${id}/review`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, getLenderToken());
  },
};

// ---------------------------------------------------------------------------
// Chat API
// ---------------------------------------------------------------------------
export const chat = {
  async getConversations(role: "farmer" | "lender" = "farmer") {
    return request("/chat/conversations", {}, role === "lender" ? getLenderToken() : undefined);
  },

  async getMessages(partnerId: string, role: "farmer" | "lender" = "farmer") {
    return request(`/chat/messages/${partnerId}`, {}, role === "lender" ? getLenderToken() : undefined);
  },

  async getUnread(role: "farmer" | "lender" = "farmer") {
    return request("/chat/unread", {}, role === "lender" ? getLenderToken() : undefined);
  },
};
