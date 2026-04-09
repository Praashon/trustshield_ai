import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const scanQuota = parseInt(body.scan_quota, 10);
    if (isNaN(scanQuota) || scanQuota < 0 || scanQuota > 1000) {
      return errorResponse('INVALID_INPUT', 'Quota must be between 0 and 1000.');
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update({ scan_quota: scanQuota })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return errorResponse('NOT_FOUND', 'User not found.', 404);
    }

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'adjust_quota',
      target_id: id,
      target_type: 'user',
      note: `Quota set to ${scanQuota}`,
    });

    return successResponse(updated);
  } catch (err) {
    console.error('[Admin Quota] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
