import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { saveScanSchema } from '@/lib/validators/scan';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401);
    }

    const body = await request.json();
    const parsed = saveScanSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('INVALID_INPUT', parsed.error.issues[0]?.message);
    }

    const { data: scan, error } = await supabase
      .from('scans')
      .update({ is_saved: parsed.data.is_saved })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !scan) {
      return errorResponse('NOT_FOUND', 'Scan not found.', 404);
    }

    return successResponse({ is_saved: scan.is_saved });
  } catch (err) {
    console.error('[Scan Save] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
