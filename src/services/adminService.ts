import type { UserWithStats, LearningContent } from '@/types/database';
import type { PaginatedResponse } from '@/types/api';
import type { AdminContentRequest, QuotaUpdateRequest } from '@/types/admin';

const BASE_URL = '/api/admin';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'An unknown error occurred');
  }
  return data.data;
}

export async function getAdminUsers(
  page = 1,
  limit = 50,
  signal?: AbortSignal
): Promise<PaginatedResponse<UserWithStats>> {
  const response = await fetch(`${BASE_URL}/users?page=${page}&limit=${limit}`, { signal });
  return handleResponse(response);
}

export async function getAdminScans(
  page = 1,
  limit = 50,
  signal?: AbortSignal
) {
  const response = await fetch(`${BASE_URL}/scans?page=${page}&limit=${limit}`, { signal });
  return handleResponse(response);
}

export async function updateUserQuota(
  userId: string,
  quota: QuotaUpdateRequest,
  signal?: AbortSignal
) {
  const response = await fetch(`${BASE_URL}/users/${userId}/quota`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quota),
    signal,
  });
  return handleResponse(response);
}

export async function createLearningContent(
  content: AdminContentRequest,
  signal?: AbortSignal
): Promise<LearningContent> {
  const response = await fetch(`${BASE_URL}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
    signal,
  });
  return handleResponse(response);
}
