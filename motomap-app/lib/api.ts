import axios from 'axios';
import type {
  ApiResponse,
  Bike,
  DiagnosisResult,
  Guide,
  PaginatedResponse,
  Part,
  PartConnection,
  TokenResponse,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.2:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// ── Bikes ────────────────────────────────────────────────────────────────────

export async function fetchBikes(): Promise<Bike[]> {
  const { data } = await apiClient.get<PaginatedResponse<Bike>>('/bikes', {
    params: { per_page: 50 },
  });
  return data.data;
}

export async function fetchBike(bikeId: string): Promise<Bike> {
  const { data } = await apiClient.get<ApiResponse<Bike>>(`/bikes/${bikeId}`);
  return data.data;
}

export async function fetchParts(bikeId: string): Promise<Part[]> {
  const { data } = await apiClient.get<PaginatedResponse<Part>>(
    `/bikes/${bikeId}/parts`,
    { params: { per_page: 100 } },
  );
  return data.data;
}

export async function fetchPart(bikeId: string, partId: string): Promise<Part> {
  const { data } = await apiClient.get<ApiResponse<Part>>(
    `/bikes/${bikeId}/parts/${partId}`,
  );
  return data.data;
}

export async function fetchPartConnections(partId: string): Promise<PartConnection[]> {
  const { data } = await apiClient.get<ApiResponse<PartConnection[]>>(
    `/parts/${partId}/connections`,
  );
  return data.data;
}

// ── Guides ───────────────────────────────────────────────────────────────────

export async function fetchGuides(bikeId?: string): Promise<Guide[]> {
  const { data } = await apiClient.get<PaginatedResponse<Guide>>('/guides', {
    params: bikeId ? { bike_id: bikeId, per_page: 100 } : { per_page: 100 },
  });
  return data.data;
}

export async function fetchGuide(guideId: string): Promise<Guide> {
  const { data } = await apiClient.get<ApiResponse<Guide>>(`/guides/${guideId}`);
  return data.data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>('/users/login', {
    email,
    password,
  });
  return data.data;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>('/users/register', {
    email,
    password,
    display_name: displayName,
  });
  return data.data;
}

// ── Diagnose ─────────────────────────────────────────────────────────────────

export async function diagnose(
  bikeId: string,
  imageUri: string,
  token: string,
): Promise<DiagnosisResult> {
  const formData = new FormData();
  formData.append('bike_id', bikeId);
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as unknown as Blob);

  const { data } = await apiClient.post<ApiResponse<DiagnosisResult>>(
    '/diagnose',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data.data;
}
