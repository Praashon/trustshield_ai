import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { learningContentSchema } from '@/lib/validators/learn';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = learningContentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('INVALID_INPUT', parsed.error.issues[0]?.message);
    }

    const { data: content, error } = await supabase
      .from('learning_content')
      .insert({
        ...parsed.data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return errorResponse('INTERNAL_ERROR', undefined, 500);
    }

    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'add_content',
      target_id: content.id,
      target_type: 'learning_content',
      note: `Added: ${parsed.data.title}`,
    });

    return successResponse(content, 201);
  } catch (err) {
    console.error('[Admin Content] Error:', err);
    return errorResponse('INTERNAL_ERROR', undefined, 500);
  }
}
