import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return errorResponse('UNAUTHORIZED', undefined, 401);

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return errorResponse('FORBIDDEN', undefined, 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: scans, error, count } = await supabase
      .from('scans')
      .select('*, analysis_results(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return errorResponse('INTERNAL_ERROR', undefined, 500);
    }

    return successResponse({
      items: scans,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[Admin Scans] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
