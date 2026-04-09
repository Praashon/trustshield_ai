import type { ScanRequest, ScanResponse } from '@/types/scan';
import type { ScanWithAnalysis } from '@/types/database';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'An unknown error occurred');
  }
  return data.data;
}

export async function submitScan(
  request: ScanRequest,
  signal?: AbortSignal
): Promise<ScanResponse> {
  const response = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  return handleResponse<ScanResponse>(response);
}

export async function getScan(
  scanId: string,
  signal?: AbortSignal
): Promise<ScanWithAnalysis> {
  const response = await fetch(`${BASE_URL}/scan/${scanId}`, { signal });
  return handleResponse<ScanWithAnalysis>(response);
}

export async function toggleSaveScan(
  scanId: string,
  isSaved: boolean,
  signal?: AbortSignal
): Promise<{ is_saved: boolean }> {
  const response = await fetch(`${BASE_URL}/scan/${scanId}/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_saved: isSaved }),
    signal,
  });
  return handleResponse<{ is_saved: boolean }>(response);
}

export async function getHistory(
  params: {
    page?: number;
    limit?: number;
    risk_level?: string;
    search?: string;
  } = {},
  signal?: AbortSignal
) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.risk_level) searchParams.set('risk_level', params.risk_level);
  if (params.search) searchParams.set('search', params.search);

  const response = await fetch(`${BASE_URL}/history?${searchParams}`, { signal });
  return handleResponse(response);
}
