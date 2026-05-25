const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('motomap_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg =
      err?.error?.message ||
      err?.detail?.message ||
      (typeof err?.detail === 'string' ? err.detail : null) ||
      res.statusText
    throw new Error(msg)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Bike {
  id: string
  make: string
  model: string
  year_start: number
  year_end: number | null
  variant: string | null
  is_active: boolean
  created_at: string
}

export interface Meta {
  total?: number
  page?: number
  per_page?: number
  version: string
  timestamp: string
}

export interface ApiResponse<T> {
  data: T
  meta: Meta
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: Meta & { total: number; page: number; per_page: number }
}

export type RiskLevel = 'SAFE' | 'CAUTION' | 'STOP'
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type ContributionStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
export type UserRole =
  | 'RIDER'
  | 'VERIFIED_ENTHUSIAST'
  | 'EXPERT_REVIEWER'
  | 'BRAND_OFFICIAL'
  | 'ADMIN'

export interface Contribution {
  id: string
  contributor_id: string
  content_type: string
  content_id: string | null
  status: ContributionStatus
  data: Record<string, unknown>
  diff: Record<string, unknown> | null
  reviewer_id: string | null
  review_notes: string | null
  version: number
  created_at: string
}

export interface User {
  id: string
  email: string
  display_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export const bikesApi = {
  list: (page = 1) =>
    api.get<PaginatedResponse<Bike>>(`/bikes?page=${page}&per_page=100`),
}

export const contributionsApi = {
  submit: (body: {
    content_type: string
    content_id?: string | null
    data: Record<string, unknown>
  }) => api.post<ApiResponse<Contribution>>('/contributions', body),

  list: (status?: ContributionStatus, page = 1) =>
    api.get<PaginatedResponse<Contribution>>(
      `/contributions?${status ? `status=${status}&` : ''}page=${page}&per_page=20`
    ),

  approve: (id: string, notes?: string) =>
    api.post<ApiResponse<Contribution>>(`/contributions/${id}/approve`, {
      review_notes: notes ?? null,
    }),

  reject: (id: string, notes: string) =>
    api.post<ApiResponse<Contribution>>(`/contributions/${id}/reject`, {
      review_notes: notes,
    }),
}

export const usersApi = {
  me: () => api.get<ApiResponse<User>>('/users/me'),
  register: (body: { email: string; password: string; display_name: string }) =>
    api.post<ApiResponse<TokenResponse>>('/users/register', body),
  login: (body: { email: string; password: string }) =>
    api.post<ApiResponse<TokenResponse>>('/users/login', body),
}
