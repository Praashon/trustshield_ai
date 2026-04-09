import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401);
    }

    const { data: scan, error } = await supabase
      .from('scans')
      .select('*, analysis_results(*)')
      .eq('id', id)
      .single();

    if (error || !scan) {
      return errorResponse('NOT_FOUND', 'Scan not found.', 404);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (scan.user_id !== user.id && profile?.role !== 'admin') {
      return errorResponse('FORBIDDEN', undefined, 403);
    }

    const result = {
      ...scan,
      analysis_result: scan.analysis_results?.[0] || null,
    };
    delete (result as Record<string, unknown>).analysis_results;

    return successResponse(result);
  } catch (err) {
    console.error('[Scan GET] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
