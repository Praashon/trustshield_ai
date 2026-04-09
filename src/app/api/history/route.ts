import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const riskLevel = searchParams.get('risk_level');
    const search = searchParams.get('search');

    let query = supabase
      .from('scans')
      .select('*, analysis_results(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (riskLevel && ['safe', 'suspicious', 'dangerous'].includes(riskLevel)) {
      query = query.eq('risk_level', riskLevel);
    }

    if (search) {
      query = query.ilike('input', `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: scans, error, count } = await query;

    if (error) {
      console.error('[History API] Error:', error);
      return errorResponse('INTERNAL_ERROR', undefined, 500);
    }

    const items = (scans || []).map((scan) => ({
      ...scan,
      analysis_result: scan.analysis_results?.[0] || null,
      analysis_results: undefined,
    }));

    return successResponse({
      items,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[History API] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
